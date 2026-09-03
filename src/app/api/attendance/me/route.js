import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ABSENCE_REASONS, resolveAbsencePolicy } from "@/lib/absence-policy";
import { decorateAttendanceDays } from "@/lib/attendance-day";
import { publicAttendanceRecord, upsertWorkerAttendance } from "@/lib/attendance-save";
import { ATTENDANCE_STATUS, dateKey, monthBounds, utcDate } from "@/lib/payroll";
import { requireNgoSession } from "@/lib/require-ngo-session";
import { ROLES } from "@/lib/navigation";
import { buildWorkerSalaryPeriod } from "@/lib/salary-period";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function payloadFrom(result, dayKey) {
  return {
    date: dayKey,
    reasons: ABSENCE_REASONS,
    period: result.period,
    calculation: {
      ...result.calculation,
      days: decorateAttendanceDays(result.calculation.days, result.attendance, result.leaves),
    },
    record: result.record,
  };
}

export async function GET(request) {
  const gate = await requireNgoSession([ROLES.WORKER]);
  if (gate.error) return jsonError(gate.error, gate.status);

  const bounds = monthBounds();
  const from = utcDate(request.nextUrl.searchParams.get("from")) ?? bounds.start;
  const to = utcDate(request.nextUrl.searchParams.get("to")) ?? bounds.end;

  const worker = await prisma.user.findFirst({
    where: { id: gate.userId, ngoId: gate.ngoId, role: ROLES.WORKER },
    include: { salary: true },
  });
  if (!worker) return jsonError("Worker not found.", 404);

  const result = await buildWorkerSalaryPeriod(prisma, {
    ngoId: gate.ngoId,
    worker,
    from,
    to,
  });

  return NextResponse.json(payloadFrom(result, dateKey(new Date())));
}

export async function POST(request) {
  const gate = await requireNgoSession([ROLES.WORKER]);
  if (gate.error) return jsonError(gate.error, gate.status);

  const body = await request.json().catch(() => ({}));
  const today = utcDate(new Date());
  const date = utcDate(body?.date) ?? today;
  const status = String(body?.status || ATTENDANCE_STATUS.PRESENT).toLowerCase();

  if (!date) return jsonError("A valid date is required.");
  if (date > today) return jsonError("You cannot mark attendance for a future date.");
  if (status !== ATTENDANCE_STATUS.PRESENT && status !== ATTENDANCE_STATUS.ABSENT) {
    return jsonError("Workers can only mark present or absent.");
  }

  const reasonInput = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (status === ATTENDANCE_STATUS.ABSENT && !reasonInput) {
    return jsonError("Please select an absent reason.");
  }

  const policy = resolveAbsencePolicy(reasonInput);
  const worker = await prisma.user.findFirst({
    where: { id: gate.userId, ngoId: gate.ngoId, role: ROLES.WORKER },
    include: { salary: true },
  });
  if (!worker) return jsonError("Worker not found.", 404);

  const joiningDate = utcDate(worker.joiningDate);
  if (joiningDate && date < joiningDate) {
    return jsonError("You cannot mark attendance before your joining date.");
  }

  const existing = await prisma.attendanceRecord.findFirst({
    where: {
      ngoId: gate.ngoId,
      userId: worker.id,
      date: { gte: date, lt: new Date(date.getTime() + 86400000) },
    },
  });

  const record = await upsertWorkerAttendance(prisma, {
    ngoId: gate.ngoId,
    userId: worker.id,
    workerName: worker.name,
    date,
    data: {
      status,
      leavePaid: status === ATTENDANCE_STATUS.ABSENT ? policy.paid : false,
      checkInAt: status === ATTENDANCE_STATUS.PRESENT ? existing?.checkInAt ?? new Date() : null,
      checkOutAt: status === ATTENDANCE_STATUS.PRESENT ? existing?.checkOutAt ?? null : null,
      reason: status === ATTENDANCE_STATUS.ABSENT ? policy.label : null,
    },
  });

  const bounds = monthBounds(date);
  const result = await buildWorkerSalaryPeriod(prisma, {
    ngoId: gate.ngoId,
    worker,
    from: bounds.start,
    to: bounds.end,
  });

  return NextResponse.json({
    item: publicAttendanceRecord(record),
    ...payloadFrom(result, dateKey(date)),
  });
}
