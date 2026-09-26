import api from "./api"
import type { StatisticsData } from "../types/Statistics"

export type StatisticsPeriod =
  | "today"
  | "7days"
  | "30days"
  | "3months"
  | "1year"

export const statisticsService = {
  async getStatistics(period: StatisticsPeriod): Promise<StatisticsData> {
    const response = await api.get<StatisticsData>("/api/statistics", {
      params: {
        period,
      },
    })

    return response.data
  },
}