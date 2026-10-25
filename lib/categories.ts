import {
  BookOpen,
  Computer,
  Dumbbell,
  Flame,
  GraduationCap,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type CategoryConfig = {
  id: string;
  label: string;
  labelSubtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  problemTypes: string[];
};

export const categories: CategoryConfig[] = [
  {
    id: "classroom",
    label: "Classroom",
    labelSubtitle: "Fans, Lights, Benches, Projectors",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    problemTypes: [
      "Fan Not Working",
      "Light Not Working",
      "Bench Broken",
      "Projector Not Working",
      "AC Not Working",
      "Window Broken",
      "Blackboard Damaged",
    ],
  },
  {
    id: "bathroom",
    label: "Bathroom",
    labelSubtitle: "Water, Leakage, Cleanliness, Smell",
    icon: Flame,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    gradient: "from-cyan-500 to-cyan-600",
    problemTypes: [
      "No Water",
      "Water Leakage",
      "Dirty",
      "Bad Smell",
      "Tap Broken",
      "Door Broken",
      "Flush Not Working",
    ],
  },
  {
    id: "lab",
    label: "Lab",
    labelSubtitle: "Computers, Internet, Equipment",
    icon: Computer,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-600",
    problemTypes: [
      "PC Not Working",
      "Internet Not Working",
      "AC Not Working",
      "Equipment Issue",
      "Power Supply Issue",
      "Keyboard/Mouse Broken",
    ],
  },
  {
    id: "library",
    label: "Library",
    labelSubtitle: "Books, Noise, AC, Seating",
    icon: BookOpen,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    gradient: "from-amber-500 to-amber-600",
    problemTypes: [
      "Book Not Available",
      "Noisy",
      "AC Not Working",
      "Seat Not Available",
      "Light Issue",
      "Damaged Books",
    ],
  },
  {
    id: "playground",
    label: "Playground",
    labelSubtitle: "Ground, Equipment, Lights, Fence",
    icon: Dumbbell,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    gradient: "from-orange-500 to-orange-600",
    problemTypes: [
      "Ground Damaged",
      "Equipment Damaged",
      "Lights Not Working",
      "Fence Broken",
      "Water Facility Issue",
    ],
  },
  {
    id: "canteen",
    label: "Canteen / Other",
    labelSubtitle: "Food, Cleanliness, Pricing, Water",
    icon: UtensilsCrossed,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    gradient: "from-rose-500 to-rose-600",
    problemTypes: [
      "Food Quality",
      "Cleanliness",
      "Pricing Issue",
      "Water Issue",
      "Other",
    ],
  },
];

export function getCategory(id: string): CategoryConfig | undefined {
  return categories.find((category) => category.id === id);
}

export const priorityColors: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-300",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Low: "bg-green-100 text-green-700 border-green-300",
};

export const statusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-700 border-orange-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  Resolved: "bg-green-100 text-green-700 border-green-300",
};

export const statusSteps = ["Pending", "In Progress", "Resolved"];

export const departmentOptions = [
  "Electrician",
  "Plumber",
  "Cleaning Staff",
  "IT Support",
  "Carpenter",
  "Maintenance",
  "Canteen Manager",
  "Librarian",
  "Other",
];
