import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function assignAgent(): Promise<string> {
  const currentDate = new Date();
  const selectedMonth = currentDate.getMonth() + 1;
  const selectedYear = currentDate.getFullYear();

  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 1);

  const agents = await prisma.user.findMany({
    where: {
      isActive: true
    }
  });

  const agentIds = agents.map(agent => agent.id);

  if (agentIds.length === 0) {
    throw new Error('No Active Agents Available.');
  }

  const agentBookings = await prisma.booking.groupBy({
    by: ['assignedAgentId'],
    where: {
      assignedAgentId: {
        in: agentIds,
        not: null,
      },
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    _count: {
      _all: true
    }
  });

  const bookingMap = new Map<string, number>();
  agentBookings.forEach(entry => {
    if (entry.assignedAgentId) {
      bookingMap.set(entry.assignedAgentId, entry._count._all);
    }
  });

  let selectedAgentId = agentIds[0];
  let minBookings = bookingMap.get(selectedAgentId) || 0;

  for (const agentId of agentIds) {
    const count = bookingMap.get(agentId) || 0;
    if (count < minBookings) {
      minBookings = count;
      selectedAgentId = agentId;
    }
  }

  return selectedAgentId;
}
