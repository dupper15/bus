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
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Area,
  Bar,
  BarChart,
  Rectangle,
  Pie, PieChart
} from "recharts";
import { TrendingUp } from "lucide-react"
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import * as DashboardService from "@/services/dashboardService";

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

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
}

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [items, setItems] = useState([
    {
      title: "Total Employees",
      icon: Users,
      total: 0,
      color: "bg-sky-300",
      iconColor: "text-sky-700",
    },
    {
      title: "Total Buses",
      icon: BusFront,
      total: 0,
      color: "bg-emerald-300",
      iconColor: "text-emerald-700",
    },
    {
      title: "Pending Requests",
      icon: StickyNote,
      total: 0,
      color: "bg-amber-300",
      iconColor: "text-amber-700",
    },
    {
      title: "Opinions",
      icon: StickyNote,
      total: 0,
      color: "bg-amber-300",
      iconColor: "text-amber-700",
    },
  ]);
  const [chartReportData, setChartReportData] = useState([]);
  const [chartLineData, setChartLineData] = useState([]);
  const [chartLineConfig, setChartLineConfig] = useState({
    visitors: {
      label: "Visitors",
    },
  });
  const [chartBusData, setChartBusData] = useState([]);
  const [chartBusConfig, setChartBusConfig] = useState({
    trips: {
      label: "trips",
    },
  });
  const [ratioLine, setRatioLine] = useState("");
  const [ratioBus, setRatioBus] = useState("");

  const mutation = useMutation({
    mutationFn: DashboardService.getSumary,
    onSuccess: (data) => {
      setItems((prevItems) =>
        prevItems.map((item, index) => {
          switch (index) {
            case 0:
              return { ...item, total: data.data.totalEmployees };
            case 1:
              return { ...item, total: data.data.totalBus };
            case 2:
              return { ...item, total: data.data.totalDayOffs };
            case 3:
              return { ...item, total: data.data.totalOpinions };
            default:
              return item;
          }
        })
      );
    },
    onError: (error) => {
      console.error("Error fetching summary:", error);
    },
  });

  const mutationRevenue = useMutation({
    mutationFn: DashboardService.getRevenue,
    onSuccess: (data) => {
      setChartReportData(data.data);
    },
    onError: (error) => {
      console.error("Error fetching summary:", error);
    },
  })

  const mutaionLine = useMutation({
    mutationFn: DashboardService.getLine,
    onSuccess: (data) => {
      const updatedData = data.data;
      const ratio = updatedData[0]?.totalVisitors / updatedData[1]?.totalVisitors;
      setRatioLine(ratio);
      let newChartLineConfig = { ...chartLineConfig }; 
      let newChartLineData = []; 
      if (updatedData[0]?.lineData && Array.isArray(updatedData[0].lineData)) {
        updatedData[0].lineData.forEach((item, index) => {
          const lineKey = `Line${index + 1}`; 
          const lineName = item.lineName; 
          const lineColor = `hsl(var(--chart-${index + 1}))`; 
  
          newChartLineConfig[lineKey] = {
            label: lineName,
            color: lineColor,
            visitors: item.visitors,
          };  
          newChartLineData.push({
            name: lineName, 
            visitors: item.visitors, 
            fill: lineColor
          });
        });
      }
  
      setChartLineConfig(newChartLineConfig);
      setChartLineData(newChartLineData); 
    },
    onError: (error) => {
      console.error("Error fetching summary:", error);
    },
  });

  const mutaionBus = useMutation({
    mutationFn: DashboardService.getBus,
    onSuccess: (data) => {
      const updatedData = data.data;

      const ratio = updatedData[0]?.totalTrip / updatedData[1]?.totalTrip;
      setRatioBus(ratio);
  
      let newChartBusConfig = { ...chartBusConfig }; 
      let newChartBusData = []; 
  
      if (updatedData[0]?.busData && Array.isArray(updatedData[0].busData)) {
        updatedData[0].busData.forEach((item, index) => {
          const busKey = `Bus${index + 1}`; 
          const busName = item.license_plate; 
          const busColor = `hsl(var(--chart-${index + 1}))`;

          newChartBusConfig[busKey] = {
            label: busName,
            color: busColor,
            total: item.total,
          };  
      
          newChartBusData.push({
            name: busName, 
            totalTrip: item.total, 
            fill: busColor
          });
        });
      }
  
      setChartBusConfig(newChartBusConfig);
      setChartBusData(newChartBusData); 
    },
    onError: (error) => {
      console.error("Error fetching summary:", error);
    },
  });

  useEffect(() => {
    mutation.mutate();
    mutationRevenue.mutate();
    mutaionLine.mutate();
    mutaionBus.mutate();
  }, []);

  const filteredReportData = chartReportData.filter((item) => {
    const date = new Date(item.date);
    const currentDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <div className='flex justify-center min-h-screen w-full bg-gray-100 px-8 py-4'>
      <div className='space-y-6 w-full max-w-6xl'>
        <div className='flex-1 basis-2/3 space-y-8 bg-white shadow-lg rounded-xl p-6 border border-gray-300'>
          {/* Cards */}
          <div className='grid grid-cols-4 gap-5 cursor-pointer'>
            {items.map((item, index) => (
              <Card
                key={index}
                className={`${item.color} hover:scale-105 transition-transform duration-200`}>
                <CardHeader>
                  <div className='flex items-center justify-between w-full'>
                    <CardTitle>{item.title}</CardTitle>
                    <item.icon className={`h-6 w-6 ml-0 ${item.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <span className='text-4xl font-semibold'>{item.total}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Revenue */}
          <Card>
            <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
              <div className='grid flex-1 gap-1 text-center sm:text-left'>
                <CardTitle>Area Chart - Financial report</CardTitle>
                <CardDescription>
                  Showing financial report for last{" "}
                  {timeRange == "7d"
                    ? "7 days."
                    : timeRange == "30d"
                    ? "30 days."
                    : "3 months."}
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className='w-[160px] rounded-lg sm:ml-auto'
                  aria-label='Select a value'>
                  <SelectValue placeholder='Last 3 months' />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='90d' className='rounded-lg'>
                    Last 3 months
                  </SelectItem>
                  <SelectItem value='30d' className='rounded-lg'>
                    Last 30 days
                  </SelectItem>
                  <SelectItem value='7d' className='rounded-lg'>
                    Last 7 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
              <ChartContainer
                config={chartReportConfig}
                className='aspect-auto h-[250px] w-full'>
                <LineChart data={filteredReportData}>
                  <defs>
                    <linearGradient
                      id='fillRevenue'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'>
                      <stop
                        offset='5%'
                        stopColor='var(--color-revenue)'
                        stopOpacity={0.8}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-revenue)'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id='fillCost' x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='5%'
                        stopColor='var(--color-cost)'
                        stopOpacity={0.8}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-cost)'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id='fillProfit' x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='5%'
                        stopColor='var(--color-profit)'
                        stopOpacity={0.8}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-profit)'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='date'
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
                        indicator='dot'
                      />
                    }
                  />
                  {/* Tô màu dưới các đường biểu đồ */}
                  <Area
                    dataKey='revenue'
                    type='monotone'
                    stroke='var(--color-revenue)'
                    fill='url(#fillRevenue)'
                    dot={false}
                  />
                  <Area
                    dataKey='cost'
                    type='monotone'
                    stroke='var(--color-cost)'
                    fill='url(#fillCost)'
                    dot={false}
                  />
                  <Area
                    dataKey='profit'
                    type='monotone'
                    stroke='var(--color-profit)'
                    fill='url(#fillProfit)'
                    dot={false}
                  />
                  {/* Các đường biểu đồ */}
                  <Line
                    dataKey='revenue'
                    type='monotone'
                    stroke='var(--color-revenue)'
                    fill='none'
                    dot={false}
                  />
                  <Line
                    dataKey='cost'
                    type='monotone'
                    stroke='var(--color-cost)'
                    fill='none'
                    dot={false}
                  />
                  <Line
                    dataKey='profit'
                    type='monotone'
                    stroke='var(--color-profit)'
                    fill='none'
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="flex gap-4">
           {/* Chart Line */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Bar Chart - Active</CardTitle>
              <CardDescription>January 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartLineConfig}>
                <BarChart accessibilityLayer data={chartLineData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(index) => {
                      if (chartLineConfig[index]) {
                        return chartLineConfig[index].label && chartLineConfig[index].color;
                      }
                      return index; 
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="visitors"
                    strokeWidth={2}
                    radius={8}
                    activeIndex={2}
                    activeBar={({ ...props }) => {
                      return (
                        <Rectangle
                          {...props}
                          fillOpacity={0.8}
                          strokeDasharray={4}
                          strokeDashoffset={4}
                        />
                      )
                    }}
                  >
                 </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-center gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Trending up by {ratioLine}% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total visitors for this month
              </div>
            </CardFooter>
          </Card>

          {/* Chart Bus */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Pie Chart - Separator None</CardTitle>
              <CardDescription>January 2025</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartBusConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartBusData}
                    dataKey="totalTrip"
                    nameKey="name"
                    stroke="0"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by {ratioBus}% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total visitors for this month
              </div>
            </CardFooter>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
