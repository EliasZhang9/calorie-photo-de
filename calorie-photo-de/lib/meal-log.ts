export const MEAL_LOG_STATUSES = [
  "uploaded",
  "analyzing",
  "analyzed",
  "failed",
] as const;

export type MealLogStatus = (typeof MEAL_LOG_STATUSES)[number];

export interface CreateMealLogInput {
  imageKey: string;
  status?: MealLogStatus;
  caloriesMin?: number;
  caloriesMax?: number;
  confidence?: string;
  title?: string;
  notes?: string;
}

export interface MealLogRecord {
  id: string;
  userName: string;
  imageKey: string;
  status: MealLogStatus;
  caloriesMin?: number;
  caloriesMax?: number;
  confidence?: string;
  title?: string;
  notes?: string;
  createdAt: string;
}

export function isMealLogStatus(value: unknown): value is MealLogStatus {
  return (
    typeof value === "string" &&
    (MEAL_LOG_STATUSES as readonly string[]).includes(value)
  );
}
