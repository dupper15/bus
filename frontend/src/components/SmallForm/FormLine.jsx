import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  ChevronsUpDown,
} from "lucide-react";
import StopService from "@/services/StopService.js";
import { warning, error } from "@/components/ui/alert.jsx";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const LineSchema = z.object({
  name: z.string().nullable().optional(),

  start_place: z
    .object({
      _id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      pointX: z.number().nullable().optional(),
      pointY: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),

  end_place: z
    .object({
      _id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      pointX: z.number().nullable().optional(),
      pointY: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),

  arr_stop: z
    .array(
      z.object({
        _id: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        pointX: z.number().nullable().optional(),
        pointY: z.number().nullable().optional(),
      })
    )
    .nullable()
    .optional(),

  time: z.number().nullable().optional(),

  status: z.enum(["draft", "published"]).nullable().optional(),
});

const FormLine = ({ isAdd, handleClose, initialData, onSubmit }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [stops, setStops] = useState([]);
  const [stations, setStations] = useState([]);
  const [submitType, setSubmitType] = useState("draft");
  const [validationErrors, setValidationErrors] = useState([]);

  const isStopValid = (stop, index, values) => {
    if (!stop) return true;

    if (index === 0) {
      return values.start_place && stop._id === values.start_place._id;
    }

    if (index === (values.arr_stop || []).length - 1) {
      return values.end_place && stop._id === values.end_place._id;
    }

    return true;
  };

  const form = useForm({
    resolver: zodResolver(LineSchema),
    defaultValues: {
      _id: initialData?._id || null,
      name: initialData?.name || "",
      start_place: initialData?.start_place || null,
      end_place: initialData?.end_place || null,
      arr_stop: initialData?.arr_stop || [],
      time: initialData?.time || 0,
    },
  });

  const moveStopUp = (index) => {
    if (index <= 0) return;
    const arr_stop = form.getValues("arr_stop") || [];
    const newStops = [...arr_stop];
    [newStops[index - 1], newStops[index]] = [
      newStops[index],
      newStops[index - 1],
    ];
    form.setValue("arr_stop", newStops);
  };

  const moveStopDown = (index) => {
    const arr_stop = form.getValues("arr_stop") || [];
    if (index >= arr_stop.length - 1) return;
    const newStops = [...arr_stop];
    [newStops[index], newStops[index + 1]] = [
      newStops[index + 1],
      newStops[index],
    ];
    form.setValue("arr_stop", newStops);
  };

  const fetchStops = useCallback(async () => {
    try {
      const response = await StopService.getStops();
      const rawStops = response.data;
      setStations(rawStops.filter((stop) => stop.isStation));
      setStops(rawStops);
    } catch (error) {
      console.error("Failed to fetch stops:", error);
    }
  }, []);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const start = form.watch("start_place");
  const end = form.watch("end_place");
  const arrStop = form.watch("arr_stop");

  useEffect(() => {
    validateRouteConnections();
  }, [start, end, arrStop]);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [106.6297, 10.8231],
        zoom: 12,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl());
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const markers = document.getElementsByClassName("mapboxgl-marker");
    while (markers[0]) markers[0].remove();

    if (mapRef.current.getSource("route")) {
      mapRef.current.removeLayer("route");
      mapRef.current.removeSource("route");
    }

    const values = form.getValues();
    const allStops = [
      values.start_place,
      ...(values.arr_stop || []),
      values.end_place,
    ].filter((stop) => stop != null);
    allStops.forEach((stop, index) => {
      if (!stop || isNaN(stop.pointX) || isNaN(stop.pointY)) return;

      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor =
        index === 0
          ? "#22c55e"
          : index === allStops.length - 1
          ? "#ef4444"
          : "#3b82f6";

      new mapboxgl.Marker(el)
        .setLngLat([stop.pointX, stop.pointY])
        .setPopup(
          new mapboxgl.Popup().setHTML(`<h3>${stop.name || "Unnamed"}</h3>`)
        )
        .addTo(mapRef.current);
    });

    if (allStops.length >= 2) {
      const coordinates = allStops.map((stop) => [stop.pointX, stop.pointY]);
      const fetchRoute = async () => {
        try {
          const coordinateString = coordinates
            .map((coord) => coord.join(","))
            .join(";");

          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateString}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();

          if (data.routes?.[0]) {
            const route = data.routes[0].geometry;

            if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

            mapRef.current.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route,
              },
            });

            mapRef.current.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
              },
            });

            const bounds = new mapboxgl.LngLatBounds();
            coordinates.forEach((coord) => bounds.extend(coord));
            mapRef.current.fitBounds(bounds, { padding: 50 });
          }
        } catch (err) {
          console.error("Failed to fetch route", err);
        }
      };

      fetchRoute();
    }
  }, [start, end, arrStop]);

  const validateRouteConnections = () => {
    const errors = [];
    const values = form.getValues();
    const arrStopIds = (values.arr_stop || []).map((stop) => stop?._id);

    if (values.start_place?._id && arrStopIds[0] !== values.start_place._id) {
      errors.push("Start place should be the first stop");
    }

    if (
      values.end_place?._id &&
      arrStopIds[arrStopIds.length - 1] !== values.end_place._id
    ) {
      errors.push("End place should be the last stop");
    }

    if (new Set(arrStopIds).size !== arrStopIds.length) {
      errors.push("Duplicate stops found in the route");
    }

    setValidationErrors(errors);
    return errors;
  };
  const handleSubmit = async (values, submitTypeOverride = submitType) => {
    try {
      const errors = validateRouteConnections();
      if (errors.length > 0) {
        errors.forEach((err) => warning(err));
        return;
      }

      const arrStopIds = (values.arr_stop || []).map((stop) => stop?._id);
      const isValid =
        (!values.start_place || arrStopIds[0] === values.start_place._id) &&
        (!values.end_place ||
          arrStopIds[arrStopIds.length - 1] === values.end_place._id) &&
        new Set(arrStopIds).size === arrStopIds.length;

      if (!isValid) {
        error("Invalid route configuration");
        return;
      }
      console.log("sumit", submitTypeOverride);
      await onSubmit({ ...values, type: submitTypeOverride });
    } catch (err) {
      error("An error occurred while saving the line");
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className='absolute inset-0 px-2 py-8 bg-black bg-opacity-80 -top-10 backdrop-blur-sm flex justify-center items-center'>
      <div className='w-full max-w-4xl overflow-y-auto scrollbar-hide  bg-white shadow-lg border rounded-lg p-4 mx-4 mb-4'>
        <h1 className='text-lg font-bold text-green-500 text-center mb-2'>
          {isAdd ? "Add New Line" : "Edit Line"}
        </h1>

        <div className='grid grid-cols-5 gap-4'>
          <div className='col-span-2'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm'>Name</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          className='h-8 text-sm'
                          placeholder='Enter Line Name'
                          {...field}
                          value={field.value ?? ""} // tránh null/undefined hiển thị "undefined"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='start_place'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm'>
                        Start Place
                        {Array.isArray(form.watch("arr_stop")) &&
                          form.watch("arr_stop")[0]?._id !==
                            field.value?._id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className='h-4 w-4 text-amber-500' />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Start place should be the first stop</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                      </FormLabel>
                      <Select
                        value={field.value?._id}
                        onValueChange={(value) => {
                          const station = stations?.find(
                            (s) => s._id === value
                          );
                          field.onChange(station);
                        }}>
                        <SelectTrigger
                          className={`h-8 text-sm ${
                            Array.isArray(form.watch("arr_stop")) &&
                            form.watch("arr_stop")[0]?._id !== field.value?._id
                              ? "border-red-500 ring-red-200"
                              : ""
                          }`}>
                          <SelectValue placeholder='Select start stop' />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(stations) &&
                            stations.map((station) => (
                              <SelectItem
                                key={station?._id || "_"}
                                value={station?._id || "_"}>
                                {station?.name || "Unnamed Station"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2 h-40 overflow-y-auto border rounded p-1'>
                  {Array.isArray(form.watch("arr_stop")) &&
                    form.watch("arr_stop").map((stop, index) => {
                      const isValid = isStopValid(
                        stop,
                        index,
                        form.getValues()
                      );

                      return (
                        <div
                          key={stop?._id || index}
                          className='flex items-center gap-1 bg-gray-50 p-1 rounded'>
                          <div className='flex flex-col'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6'
                              onClick={() => moveStopUp(index)}
                              disabled={index === 0}>
                              <ChevronUp className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6'
                              onClick={() => moveStopDown(index)}
                              disabled={
                                index === form.watch("arr_stop").length - 1
                              }>
                              <ChevronDown className='h-4 w-4' />
                            </Button>
                          </div>

                          <Select
                            value={stop?._id}
                            onValueChange={(value) => {
                              const newStop = stops.find(
                                (s) => s._id === value
                              );
                              const arr_stop = Array.isArray(
                                form.getValues("arr_stop")
                              )
                                ? [...form.getValues("arr_stop")]
                                : [];
                              arr_stop[index] = newStop;
                              form.setValue("arr_stop", arr_stop);
                            }}>
                            <SelectTrigger
                              className={`h-8 text-sm flex-1 ${
                                !isValid ? "border-red-500 ring-red-200" : ""
                              }`}>
                              <SelectValue
                                placeholder={`Select stop ${index + 1}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(stops) &&
                                stops.map((s) => (
                                  <SelectItem
                                    key={s?._id || "_"}
                                    value={s?._id || "_"}>
                                    {s?.name || "Unnamed Stop"}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => {
                              const arr_stop = Array.isArray(
                                form.getValues("arr_stop")
                              )
                                ? form
                                    .getValues("arr_stop")
                                    .filter((_, i) => i !== index)
                                : [];
                              form.setValue("arr_stop", arr_stop);
                            }}>
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    const arr_stop = form.getValues("arr_stop");
                    form.setValue("arr_stop", [...arr_stop, null]);
                  }}>
                  Add Stop
                </Button>

                <FormField
                  control={form.control}
                  name='end_place'
                  render={({ field }) => {
                    const arrStop = form.watch("arr_stop");
                    const lastStopId =
                      Array.isArray(arrStop) && arrStop.length > 0
                        ? arrStop[arrStop.length - 1]?._id
                        : null;

                    const isInvalid =
                      lastStopId && lastStopId !== field.value?._id;

                    return (
                      <FormItem>
                        <FormLabel className='text-sm flex items-center gap-1'>
                          End Place
                          {isInvalid && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className='h-4 w-4 text-amber-500' />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>End place should be the last stop</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </FormLabel>
                        <Select
                          value={field.value?._id}
                          onValueChange={(value) => {
                            const station = stations.find(
                              (s) => s._id === value
                            );
                            field.onChange(station);
                          }}>
                          <SelectTrigger
                            className={`h-8 text-sm ${
                              isInvalid ? "border-red-500 ring-red-200" : ""
                            }`}>
                            <SelectValue placeholder='Select end stop' />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(stations) &&
                              stations.map((station) => (
                                <SelectItem
                                  key={station?._id || "_"}
                                  value={station?._id || "_"}>
                                  {station?.name || "Unnamed Station"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name='time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm'>Time (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          inputMode='numeric'
                          className='h-8 text-sm'
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Nếu giá trị rỗng → coi là null
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              // Ép kiểu an toàn sang number
                              const num = Number(val);
                              if (!isNaN(num)) {
                                field.onChange(num);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleClose}
                    className='h-8 text-sm'>
                    Cancel
                  </Button>

                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      setSubmitType("draft");
                      form.handleSubmit(
                        handleSubmit(form.getValues(), "draft")
                      )();
                    }}
                    className='h-8 text-sm'>
                    Save Draft
                  </Button>

                  <Button
                    type='button'
                    onClick={() => {
                      setSubmitType("published");
                      form.handleSubmit(
                        handleSubmit(form.getValues(), "published")
                      )();
                    }}
                    className='h-8 text-sm bg-green-500 hover:bg-green-600'>
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className='col-span-3 relative'>
            <div ref={mapContainerRef} className='h-full rounded-lg border' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormLine;
