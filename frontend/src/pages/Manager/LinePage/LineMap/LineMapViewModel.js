import React, {useEffect, useRef, useState, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Button} from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {transformLine, transformStop} from "@/utils/Transformer.js";
import LineService from "@/services/LineService.js";
import StopService from "@/services/StopService.js";

const useLineMapViewModel = ({currentLine, mode, onLineUpdate}) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [stops, setStops] = useState([]);
    const [lines, setLines] = useState([]);
    const [selectedLine, setSelectedLine] = useState(null);
    const [showLineForm, setShowLineForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', start_place: null, end_place: null, time: 0, arr_stop: []
    });

    // Fetch stops and lines
    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            setStops(rawStops.map(transformStop));
        } catch (error) {
            console.error("Failed to fetch stops:", error);
        }
    }, []);

    const fetchLines = useCallback(async () => {
        try {
            const response = await LineService.getLines();
            const rawLines = response.data;
            const sortedLines = rawLines
                .map(transformLine)
                .sort((a, b) => a.name.localeCompare(b.name));
            setLines(sortedLines);
        } catch (error) {
            console.error("Error fetching lines:", error);
        }
    }, []);

    useEffect(() => {
        fetchStops();
        fetchLines();
    }, [fetchLines, fetchStops]);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [106.6297, 10.8231], // Ho Chi Minh City coordinates
                zoom: 12
            });

            // Add navigation control
            mapRef.current.addControl(new mapboxgl.NavigationControl());
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map when stops or lines change
    useEffect(() => {
        if (!mapRef.current) return;

        // Add stops markers
        stops.forEach(stop => {
            const marker = new mapboxgl.Marker()
                .setLngLat([stop.pointX, stop.pointY])
                .setPopup(new mapboxgl.Popup().setHTML(`<h3>${stop.name}</h3><p>${stop.address}</p>`))
                .addTo(mapRef.current);
        });

        // Draw selected line
        if (selectedLine) {
            const coordinates = [[selectedLine.start_place.pointX, selectedLine.start_place.pointY], ...selectedLine.arr_stop.map(stop => [stop.pointX, stop.pointY]), [selectedLine.end_place.pointX, selectedLine.end_place.pointY]];

            if (mapRef.current.getSource('route')) {
                mapRef.current.removeLayer('route');
                mapRef.current.removeSource('route');
            }

            mapRef.current.addSource('route', {
                type: 'geojson', data: {
                    type: 'Feature', properties: {}, geometry: {
                        type: 'LineString', coordinates: coordinates
                    }
                }
            });

            mapRef.current.addLayer({
                id: 'route', type: 'line', source: 'route', layout: {
                    'line-join': 'round', 'line-cap': 'round'
                }, paint: {
                    'line-color': '#888', 'line-width': 8
                }
            });
        }
    }, [stops, selectedLine]);

    // Handle stop reordering
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(formData.arr_stop);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFormData({
            ...formData, arr_stop: items
        });
    };

    // Line form component
    const LineForm = () => (<Dialog open={showLineForm} onOpenChange={() => setShowLineForm(false)}>
        <DialogContent className="sm:max-w-[900px] flex">
            <div className="w-1/2 pr-4">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add New Line' : 'Edit Line'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select
                        value={formData.start_place?.id}
                        onValueChange={(value) => {
                            const stop = stops.find(s => s.id === value);
                            setFormData({...formData, start_place: stop});
                        }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select start stop"/>
                        </SelectTrigger>
                        <SelectContent>
                            {stops.map(stop => (<SelectItem key={stop.id} value={stop.id}>
                                {stop.name}
                            </SelectItem>))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={formData.end_place?.id}
                        onValueChange={(value) => {
                            const stop = stops.find(s => s.id === value);
                            setFormData({...formData, end_place: stop});
                        }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select end stop"/>
                        </SelectTrigger>
                        <SelectContent>
                            {stops.map(stop => (<SelectItem key={stop.id} value={stop.id}>
                                {stop.name}
                            </SelectItem>))}
                        </SelectContent>
                    </Select>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="stops">
                            {(provided) => (<div {...provided.droppableProps} ref={provided.innerRef}>
                                {formData.arr_stop.map((stop, index) => (
                                    <Draggable key={stop.id} draggableId={stop.id} index={index}>
                                        {(provided) => (<div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Select
                                                value={stop.id}
                                                onValueChange={(value) => {
                                                    const newStop = stops.find(s => s.id === value);
                                                    const newArr = [...formData.arr_stop];
                                                    newArr[index] = newStop;
                                                    setFormData({...formData, arr_stop: newArr});
                                                }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Stop ${index + 1}`}/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stops.map(s => (<SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    const newArr = formData.arr_stop.filter((_, i) => i !== index);
                                                    setFormData({...formData, arr_stop: newArr});
                                                }}>
                                                ×
                                            </Button>
                                        </div>)}
                                    </Draggable>))}
                                {provided.placeholder}
                            </div>)}
                        </Droppable>
                    </DragDropContext>

                    <Button
                        onClick={() => {
                            setFormData({
                                ...formData, arr_stop: [...formData.arr_stop, null]
                            });
                        }}>
                        Add Stop
                    </Button>
                </div>
            </div>
            <div className="w-1/2">
                <div ref={mapContainerRef} className="h-[500px]"/>
            </div>
        </DialogContent>
    </Dialog>);

    return {
        mapContainerRef,
        stops,
        lines,
        selectedLine,
        showLineForm,
        formData,
        setSelectedLine,
        setShowLineForm,
        setFormData,
        LineForm
    };
};

export default useLineMapViewModel;