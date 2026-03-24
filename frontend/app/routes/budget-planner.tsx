import type { Route } from "./+types/budget-planner";
import { BudgetPlanner } from '~/components/BudgetPlanner';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Budget Planner - Student Life" },
    { name: "description", content: "Manage your income and expenses" },
  ];
}

export default function BudgetPlannerRoute() {
  return <BudgetPlanner />;
}
