import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Task {
  id: number;
  zone: string;
  address: string;
  clientName: string;
  phone: string;
  status: 'pending' | 'delivered' | 'failed';
  time: string;
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  tasks: Task[];
}

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const pendingIcon = createCustomIcon('#eab308');
const deliveredIcon = createCustomIcon('#22c55e');
const failedIcon = createCustomIcon('#ef4444');

const DeliveryMap = ({ tasks }: DeliveryMapProps) => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return pendingIcon;
      case 'delivered':
        return deliveredIcon;
      case 'failed':
        return failedIcon;
      default:
        return pendingIcon;
    }
  };

  const routeCoordinates = tasks
    .filter(task => task.status === 'pending')
    .map(task => [task.lat, task.lng] as [number, number]);

  const center: [number, number] = tasks.length > 0 
    ? [tasks[0].lat, tasks[0].lng]
    : [55.751244, 37.618423];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          color="#0ea5e9"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}

      {tasks.map((task) => (
        <Marker
          key={task.id}
          position={[task.lat, task.lng]}
          icon={getIcon(task.status)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold mb-1">{task.address}</p>
              <p className="text-muted-foreground">{task.clientName}</p>
              <p className="text-muted-foreground">{task.phone}</p>
              <p className="text-muted-foreground mt-1">Время: {task.time}</p>
              <p className={`mt-1 font-semibold ${
                task.status === 'pending' ? 'text-yellow-600' :
                task.status === 'delivered' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {task.status === 'pending' ? 'В ожидании' :
                 task.status === 'delivered' ? 'Доставлено' :
                 'Не доставлено'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DeliveryMap;
