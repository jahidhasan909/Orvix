import { dateKey, utcDate } from "@/lib/payroll";

export function dayRange(value) {
  const start = utcDate(value);
  if (!start) return null;
  return { start, end: new Date(start.getTime() + 86400000) };
}

export async function upsertWorkerAttendance(prisma, { ngoId, userId, workerName, date, data }) {
  const range = dayRange(date);
  if (!range) throw new Error("Invalid attendance date.");

  const existing = await prisma.attendanceRecord.findMany({
    where: {
      ngoId,
      userId,
      date: { gte: range.start, lt: range.end },
    },
    orderBy: { createdAt: "asc" },
  });

  const payload = {
    ngoId,
    userId,
    worker: workerName,
    date: range.start,
    ...data,
  };

  if (!existing.length) {
    return prisma.attendanceRecord.create({ data: payload });
  }

  const [keep, ...duplicates] = existing;
  const record = await prisma.attendanceRecord.update({
    where: { id: keep.id },
    data: payload,
  });

  if (duplicates.length) {
    await prisma.attendanceRecord.deleteMany({
      where: { id: { in: duplicates.map((item) => item.id) } },
    });
  }

  return record;
}

export function publicAttendanceRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    userId: record.userId,
    date: dateKey(record.date),
    status: record.status,
    reason: record.reason || "",
    leavePaid: Boolean(record.leavePaid),
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
  };
}
