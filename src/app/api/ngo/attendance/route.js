import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ABSENCE_REASONS, resolveAbsencePolicy } from "@/lib/absence-policy";
import { ATTENDANCE_STATUS, dateKey, monthBounds, utcDate } from "@/lib/payroll";
import { requireNgoAdmin } from "@/lib/require-ngo-admin";
import { ROLES } from "@/lib/navigation";
import { buildWorkerSalaryPeriod } from "@/lib/salary-period";

const ALLOWED = new Set(Object.values(ATTENDANCE_STATUS));

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request) {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);

  const date = utcDate(request.nextUrl.searchParams.get("date") || new Date());
  if (!date) return jsonError("A valid date is required.");

  const [workers, records] = await Promise.all([
    prisma.user.findMany({
      where: { ngoId: gate.ngoId, role: ROLES.WORKER },
      orderBy: { name: "asc" },
      select: { id: true, name: true, employeeId: true, designation: true, status: true },
    }),
    prisma.attendanceRecord.findMany({
      where: { ngoId: gate.ngoId, date },
    }),
  ]);

  const byUser = Object.fromEntries(records.map((record) => [record.userId, record]));

  return NextResponse.json({
    date: dateKey(date),
    reasons: ABSENCE_REASONS,
    items: workers.map((worker) => ({
      ...worker,
      attendance: byUser[worker.id]
        ? {
            id: byUser[worker.id].id,
            status: byUser[worker.id].status,
            leavePaid: byUser[worker.id].leavePaid,
            reason: byUser[worker.id].reason || "",
            checkInAt: byUser[worker.id].checkInAt,
            checkOutAt: byUser[worker.id].checkOutAt,
          }
        : null,
    })),
  });
}

export async function POST(request) {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);

  const body = await request.json().catch(() => null);
  const date = utcDate(body?.date);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const status = String(body?.status || "").toLowerCase();
  const leavePaid = body?.leavePaid === true;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!date) return jsonError("A valid date is required.");
  if (!userId) return jsonError("Worker is required.");
  if (!ALLOWED.has(status)) return jsonError("Invalid attendance status.");
  if (status === ATTENDANCE_STATUS.ABSENT && !reason) {
    return jsonError("An absent reason is required.");
  }

  const policy = resolveAbsencePolicy(reason);

  const worker = await prisma.user.findFirst({
    where: { id: userId, ngoId: gate.ngoId, role: ROLES.WORKER },
    select: { id: true, name: true },
  });
  if (!worker) return jsonError("Worker not found.", 404);

  const existing = await prisma.attendanceRecord.findFirst({
    where: { ngoId: gate.ngoId, userId, date },
  });

  const data = {
    ngoId: gate.ngoId,
    userId,
    worker: worker.name,
    date,
    status,
    leavePaid: status === ATTENDANCE_STATUS.LEAVE ? leavePaid : status === ATTENDANCE_STATUS.ABSENT ? policy.paid : false,
    reason: status === ATTENDANCE_STATUS.ABSENT ? policy.label : null,
    checkInAt: status === ATTENDANCE_STATUS.PRESENT || status === ATTENDANCE_STATUS.LATE
      ? existing?.checkInAt ?? new Date()
      : null,
  };

  const record = existing
    ? await prisma.attendanceRecord.update({ where: { id: existing.id }, data })
    : await prisma.attendanceRecord.create({ data });

  const full = await prisma.user.findFirst({
    where: { id: userId, ngoId: gate.ngoId, role: ROLES.WORKER },
    include: { salary: true },
  });
  if (full) {
    const bounds = monthBounds(date);
    await buildWorkerSalaryPeriod(prisma, { ngoId: gate.ngoId, worker: full, from: bounds.start, to: bounds.end });
  }

  return NextResponse.json({ item: record });
}
