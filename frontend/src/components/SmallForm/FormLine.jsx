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
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import StopService from "@/services/StopService.js";

mapboxgl.accessToken = 'pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg';

// Form schema remains the same
const formSchema = z.object({
    name: z.string().nonempty({ message: "Name is required." }),
    start_place: z.object({
        id: z.string(),
        name: z.string(),
        pointX: z.number(),
        pointY: z.number(),
    }).nullable(),
    end_place: z.object({
        id: z.string(),
        name: z.string(),
        pointX: z.number(),
        pointY: z.number(),
    }).nullable(),
    arr_stop: z.array(z.object({
        id: z.string(),
        name: z.string(),
        pointX: z.number(),
        pointY: z.number(),
    })),
    time: z.number().min(0, { message: "Time must be a positive number." }),
});

const FormLine = ({
                      isAdd,
                      handleClose,
                      initialData,
                      onSubmit,
                  }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [stops, setStops] = useState([]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            _id: initialData?._id || null,
            name: initialData?.name || "",
            start_place: initialData?.start_place || null,
            end_place: initialData?.end_place || null,
            arr_stop: initialData?.arr_stop || [],
            time: initialData?.time || 0,
        },
    });

    // Function to move a stop up in the array
    const moveStopUp = (index) => {
        if (index <= 0) return; // Can't move up if first item
        const arr_stop = form.getValues('arr_stop');
        const newStops = [...arr_stop];
        [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
        form.setValue('arr_stop', newStops);
    };

    // Function to move a stop down in the array
    const moveStopDown = (index) => {
        const arr_stop = form.getValues('arr_stop');
        if (index >= arr_stop.length - 1) return; // Can't move down if last item
        const newStops = [...arr_stop];
        [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
        form.setValue('arr_stop', newStops);
    };

    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            setStops(rawStops);
        } catch (error) {
            console.error("Failed to fetch stops:", error);
        }
    }, []);

    useEffect(() => {
        fetchStops();
    }, [fetchStops]);

    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [106.6297, 10.8231],
                zoom: 12
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
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [106.6297, 10.8231],
                zoom: 12
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl());

            // Add load event handler
            mapRef.current.on('load', () => {
                // Set a flag or state to indicate map is ready
                mapRef.current.isStyleLoaded = true;
            });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        console.log(form.getValues())
        // Return early if map isn't initialized or style isn't loaded
        if (!mapRef.current || !mapRef.current.isStyleLoaded) return;


            const markers = document.getElementsByClassName('mapboxgl-marker');
            while (markers[0]) {
                markers[0].remove();
            }

            if (mapRef.current.getSource('route')) {
                mapRef.current.removeLayer('route');
                mapRef.current.removeSource('route');
            }

            const values = form.getValues();
            const allStops = [
                values.start_place,
                ...values.arr_stop,
                values.end_place
            ].filter(stop => stop !== null);

            allStops.forEach((stop, index) => {
                if (!stop) return;

                const el = document.createElement('div');
                el.className = 'marker';
                el.style.width = '20px';
                el.style.height = '20px';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = index === 0 ? '#22c55e' :
                    index === allStops.length - 1 ? '#ef4444' : '#3b82f6';

                new mapboxgl.Marker(el)
                    .setLngLat([stop.pointX, stop.pointY])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${stop.name}</h3>`))
                    .addTo(mapRef.current);
            });

            if (allStops.length >= 2) {
                const coordinates = allStops.map(stop => [stop.pointX, stop.pointY]);

                const fetchRoute = async () => {
                    try {
                        // Check again if map is loaded before fetching route

                        const coordinateString = coordinates
                            .map(coord => coord.join(','))
                            .join(';');

                        const response = await fetch(
                            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateString}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                        );
                        const data = await response.json();

                        if (data.routes && data.routes[0]) {
                            const route = data.routes[0].geometry;

                            // Additional check before adding source and layer
                            if (!mapRef.current || !mapRef.current.isStyleLoaded) return;if (mapRef.current.getSource('route')) {
                                mapRef.current.removeLayer('route');
                                mapRef.current.removeSource('route');
                            }

                            mapRef.current.addSource('route', {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: route
                                }
                            });

                            mapRef.current.addLayer({
                                id: 'route',
                                type: 'line',
                                source: 'route',
                                layout: {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                paint: {
                                    'line-color': '#3b82f6',
                                    'line-width': 4
                                }
                            });

                            const bounds = new mapboxgl.LngLatBounds();
                            coordinates.forEach(coord => bounds.extend(coord));
                            mapRef.current.fitBounds(bounds, { padding: 50 });
                        }
                    } catch (error) {
                        console.error('Error fetching route:', error);
                    }
                };

                fetchRoute();
            }
    }, [form.watch('start_place'), form.watch('end_place'), form.watch('arr_stop')]);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const arr_stop = form.getValues('arr_stop');
        console.log(arr_stop);
        const items = Array.from(arr_stop);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        form.setValue('arr_stop', items);
    };

    const handleSubmit = async (values) => {
        try {
            await onSubmit(values);
            handleClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className='absolute inset-0 bg-black bg-opacity-80 -top-10 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-full max-w-4xl bg-white shadow-lg border rounded-lg p-4 mx-4'>
                <h1 className='text-xl font-bold text-green-500 text-center mb-4'>
                    {isAdd ? "Add New Line" : "Edit Line"}
                </h1>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
                                {!isAdd && (
                                    <div className='flex flex-col space-y-1'>
                                        <FormLabel>ID:</FormLabel>
                                        <div className='text-gray-700 bg-gray-100 p-1 rounded border'>
                                            {form.getValues('_id')}
                                        </div>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Enter Line Name' {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='start_place'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Start Place</FormLabel>
                                            <Select
                                                value={field.value?._id}
                                                onValueChange={(value) => {
                                                    console.log(field.value?._id);
                                                    const stop = stops.find(s => s._id === value);
                                                    field.onChange(stop);
                                                }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select start stop"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stops.map(stop => (
                                                        <SelectItem key={stop._id} value={stop._id}>
                                                            {stop.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3 h-48 overflow-y-auto border rounded p-2">
                                    {form.watch('arr_stop').map((stop, index) => (
                                        <div key={stop?._id || index}
                                             className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                            <div className="flex flex-col">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => moveStopUp(index)}
                                                    disabled={index === 0}
                                                >
                                                    <ChevronUp className="h-4 w-4"/>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => moveStopDown(index)}
                                                    disabled={index === form.watch('arr_stop').length - 1}
                                                >
                                                    <ChevronDown className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                            <Select
                                                value={stop?._id}
                                                onValueChange={(value) => {
                                                    const newStop = stops.find(s => s._id === value);
                                                    const arr_stop = form.getValues('arr_stop');
                                                    arr_stop[index] = newStop;
                                                    form.setValue('arr_stop', arr_stop);
                                                }}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder={`Select stop ${index + 1}`}/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stops.map(s => (
                                                        <SelectItem key={s._id} value={s._id}>
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const arr_stop = form.getValues('arr_stop');
                                                    form.setValue('arr_stop', arr_stop.filter((_, i) => i !== index));
                                                }}>
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const arr_stop = form.getValues('arr_stop');
                                        form.setValue('arr_stop', [...arr_stop, null]);
                                    }}>
                                    Add Stop
                                </Button>

                                <FormField
                                    control={form.control}
                                    name='end_place'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>End Place</FormLabel>
                                            <Select
                                                value={field.value?._id}
                                                onValueChange={(value) => {
                                                    const stop = stops.find(s => s._id === value);
                                                    field.onChange(stop);
                                                }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select end stop"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stops.map(stop => (
                                                        <SelectItem key={stop._id}
                                                                    value={stop._id}>  {/* Changed from stop.id to stop._id */}
                                                            {stop.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='time'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Time (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" {...field}
                                                       onChange={e => field.onChange(Number(e.target.value))}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <div className='flex justify-end gap-3'>
                                    <Button variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-green-500 hover:bg-green-600">
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>

                    <div className='relative'>
                        <div ref={mapContainerRef} className='h-full rounded-lg border'/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormLine;
