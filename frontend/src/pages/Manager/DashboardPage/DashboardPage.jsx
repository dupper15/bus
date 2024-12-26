import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { AppSidebar } from "../../../components/app-sidebar";
import { BusFront, StickyNote, Users } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useState } from "react";

const items = [
  {
    title: "Total Employees",
    icon: Users,
    total: 20,
    color: "bg-sky-300", // Màu nền cho Card
    iconColor: "text-sky-700", // Màu cho Icon
  },
  {
    title: "Total Buses",
    icon: BusFront,
    total: 10,
    color: "bg-emerald-300", // Màu nền cho Card
    iconColor: "text-emerald-700", // Màu cho Icon
  },
  {
    title: "Request Leave",
    icon: StickyNote,
    total: 2,
    color: "bg-amber-300", // Màu nền cho Card
    iconColor: "text-amber-700", // Màu cho Icon
  },
  {
    title: "Opinion",
    icon: StickyNote,
    total: 10,
    color: "bg-amber-300", // Màu nền cho Card
    iconColor: "text-amber-700", // Màu cho Icon
  },
];

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

const chartReportData = [
  { date: "2024-04-01", revenue: 222, cost: 150, profit: 123 },
  { date: "2024-04-02", revenue: 97, cost: 180, profit: 123 },
  { date: "2024-04-03", revenue: 167, cost: 120, profit: 123 },
  { date: "2024-04-04", revenue: 242, cost: 260, profit: 123 },
  { date: "2024-04-05", revenue: 373, cost: 290, profit: 123 },
  { date: "2024-04-06", revenue: 301, cost: 340, profit: 123 },
  { date: "2024-04-07", revenue: 245, cost: 180, profit: 123 },
  { date: "2024-04-08", revenue: 409, cost: 320, profit: 123 },
  { date: "2024-04-09", revenue: 59, cost: 110, profit: 123 },
  { date: "2024-04-10", revenue: 261, cost: 190, profit: 123 },
  { date: "2024-04-11", revenue: 327, cost: 350, profit: 123 },
  { date: "2024-04-12", revenue: 292, cost: 210, profit: 123 },
  { date: "2024-04-13", revenue: 342, cost: 380, profit: 123 },
  { date: "2024-04-14", revenue: 137, cost: 220, profit: 123 },
  { date: "2024-04-15", revenue: 120, cost: 170, profit: 123 },
  { date: "2024-04-16", revenue: 138, cost: 190, profit: 123 },
  { date: "2024-04-17", revenue: 446, cost: 360, profit: 123 },
  { date: "2024-04-18", revenue: 364, cost: 410, profit: 123 },
  { date: "2024-04-19", revenue: 243, cost: 180, profit: 123 },
  { date: "2024-04-20", revenue: 89, cost: 150, profit: 123 },
  { date: "2024-04-21", revenue: 137, cost: 200, profit: 123 },
  { date: "2024-04-22", revenue: 224, cost: 170, profit: 123 },
  { date: "2024-04-23", revenue: 138, cost: 230, profit: 123 },
  { date: "2024-04-24", revenue: 387, cost: 290, profit: 123 },
  { date: "2024-04-25", revenue: 215, cost: 250, profit: 123 },
  { date: "2024-04-26", revenue: 75, cost: 130, profit: 123 },
  { date: "2024-04-27", revenue: 383, cost: 420, profit: 123 },
  { date: "2024-04-28", revenue: 122, cost: 180, profit: 123 },
  { date: "2024-04-29", revenue: 315, cost: 240, profit: 123 },
  { date: "2024-04-30", revenue: 454, cost: 380, profit: 123 },
  { date: "2024-05-01", revenue: 165, cost: 220, profit: 123 },
  { date: "2024-05-02", revenue: 293, cost: 310, profit: 123 },
  { date: "2024-05-03", revenue: 247, cost: 190, profit: 123 },
  { date: "2024-05-04", revenue: 385, cost: 420, profit: 123 },
  { date: "2024-05-05", revenue: 481, cost: 390, profit: 123 },
  { date: "2024-05-06", revenue: 498, cost: 520, profit: 123 },
  { date: "2024-05-07", revenue: 388, cost: 300, profit: 123 },
  { date: "2024-05-08", revenue: 149, cost: 210, profit: 123 },
  { date: "2024-05-09", revenue: 227, cost: 180, profit: 123 },
  { date: "2024-05-10", revenue: 293, cost: 330, profit: 123 },
  { date: "2024-05-11", revenue: 335, cost: 270, profit: 123 },
  { date: "2024-05-12", revenue: 197, cost: 240, profit: 123 },
  { date: "2024-05-13", revenue: 197, cost: 160, profit: 123 },
  { date: "2024-05-14", revenue: 448, cost: 490, profit: 123 },
  { date: "2024-05-15", revenue: 473, cost: 380, profit: 123 },
  { date: "2024-05-16", revenue: 338, cost: 400, profit: 123 },
  { date: "2024-05-17", revenue: 499, cost: 420, profit: 123 },
  { date: "2024-05-18", revenue: 315, cost: 350, profit: 123 },
  { date: "2024-05-19", revenue: 235, cost: 180, profit: 123 },
  { date: "2024-05-20", revenue: 177, cost: 230, profit: 123 },
  { date: "2024-05-21", revenue: 82, cost: 140, profit: 123 },
  { date: "2024-05-22", revenue: 81, cost: 120, profit: 123 },
  { date: "2024-05-23", revenue: 252, cost: 290, profit: 123 },
  { date: "2024-05-24", revenue: 294, cost: 220, profit: 123 },
  { date: "2024-05-25", revenue: 201, cost: 250, profit: 123 },
  { date: "2024-05-26", revenue: 213, cost: 170, profit: 123 },
  { date: "2024-05-27", revenue: 420, cost: 460, profit: 123 },
  { date: "2024-05-28", revenue: 233, cost: 190, profit: 123 },
  { date: "2024-05-29", revenue: 78, cost: 130, profit: 123 },
  { date: "2024-05-30", revenue: 340, cost: 280, profit: 123 },
  { date: "2024-05-31", revenue: 178, cost: 230, profit: 123 },
  { date: "2024-06-01", revenue: 178, cost: 200, profit: 123 },
  { date: "2024-06-02", revenue: 470, cost: 410, profit: 123 },
  { date: "2024-06-03", revenue: 103, cost: 160, profit: 123 },
  { date: "2024-06-04", revenue: 439, cost: 380, profit: 123 },
  { date: "2024-06-05", revenue: 88, cost: 140, profit: 123 },
  { date: "2024-06-06", revenue: 294, cost: 250, profit: 123 },
  { date: "2024-06-07", revenue: 323, cost: 370, profit: 123 },
  { date: "2024-06-08", revenue: 385, cost: 320, profit: 123 },
  { date: "2024-06-09", revenue: 438, cost: 480, profit: 123 },
  { date: "2024-06-10", revenue: 155, cost: 200, profit: 123 },
  { date: "2024-06-11", revenue: 92, cost: 150, profit: 123 },
  { date: "2024-06-12", revenue: 492, cost: 420, profit: 123 },
  { date: "2024-06-13", revenue: 81, cost: 130, profit: 123 },
  { date: "2024-06-14", revenue: 426, cost: 380, profit: 123 },
  { date: "2024-06-15", revenue: 307, cost: 350, profit: 123 },
  { date: "2024-06-16", revenue: 371, cost: 310, profit: 123 },
  { date: "2024-06-17", revenue: 475, cost: 520, profit: 123 },
  { date: "2024-06-18", revenue: 107, cost: 170, profit: 123 },
  { date: "2024-06-19", revenue: 341, cost: 290, profit: 123 },
  { date: "2024-06-20", revenue: 408, cost: 450, profit: 123 },
  { date: "2024-06-21", revenue: 169, cost: 210, profit: 123 },
  { date: "2024-06-22", revenue: 317, cost: 270, profit: 123 },
  { date: "2024-06-23", revenue: 480, cost: 530, profit: 123 },
  { date: "2024-06-24", revenue: 132, cost: 180, profit: 123 },
  { date: "2024-06-25", revenue: 141, cost: 190, profit: 123 },
  { date: "2024-06-26", revenue: 434, cost: 380, profit: 123 },
  { date: "2024-06-27", revenue: 448, cost: 490, profit: 123 },
  { date: "2024-06-28", revenue: 149, cost: 200, profit: 123 },
  { date: "2024-06-29", revenue: 103, cost: 160, profit: 123 },
  { date: "2024-06-30", revenue: 446, cost: 400, profit: 123 },
];

const chartReportConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-4))",
  },
  cost: {
    label: "Cost",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-2))",
  },
};

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const filteredReportData = chartReportData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <div className="flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4">
      <div className="space-y-6 w-full max-w-6xl">
        <div className="flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300">
          {/* Cards */}
          <div className="grid grid-cols-4 gap-5 cursor-pointer">
            {items.map((item, index) => (
              <Card
                key={index}
                className={`${item.color} hover:scale-105 transition-transform duration-200`}>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle>{item.title}</CardTitle>
                    <item.icon className={`h-6 w-6 ml-0 ${item.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-semibold">{item.total}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1 text-center sm:text-left">
                <CardTitle>Area Chart - Interactive</CardTitle>
                <CardDescription>
                  Showing financial report for last{" "}
                  {timeRange == "90d"
                    ? "3 months."
                    : timeRange == "30d"
                    ? "30 days."
                    : "7 days."}
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select a value">
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    Last 3 months
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    Last 7 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full">
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient
                      id="fillDesktop"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="url(#fillMobile)"
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>

            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1 text-center sm:text-left">
                <CardTitle>Area Chart - Financial report</CardTitle>
                <CardDescription>
                  Showing financial report for last{" "}
                  {timeRange == "90d"
                    ? "3 months."
                    : timeRange == "30d"
                    ? "30 days."
                    : "7 days."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer
                config={chartReportConfig}
                className="aspect-auto h-[250px] w-full">
                <AreaChart data={filteredReportData}>
                  <defs>
                    <linearGradient
                      id="fillRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-cost)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-cost)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-profit)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-profit)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"
                    stackId="a"
                  />
                  <Area
                    dataKey="cost"
                    type="natural"
                    fill="url(#fillCost)"
                    stroke="var(--color-cost)"
                    stackId="a"
                  />
                  <Area
                    dataKey="profit"
                    type="natural"
                    fill="url(#fillProfit)"
                    stroke="var(--color-profit)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
