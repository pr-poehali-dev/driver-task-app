import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import DeliveryMap from '@/components/DeliveryMap';
import AdminPanel from '@/components/AdminPanel';

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
  driverId: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'driver' | 'dispatcher';
  time: string;
}

const Index = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([
    {
      id: 1,
      zone: 'Центральный район',
      address: 'ул. Ленина, д. 45, кв. 12',
      clientName: 'Иванов Петр',
      phone: '+7 999 123-45-67',
      status: 'pending',
      time: '10:00',
      lat: 55.751244,
      lng: 37.618423,
      driverId: '247'
    },
    {
      id: 2,
      zone: 'Центральный район',
      address: 'пр. Мира, д. 23',
      clientName: 'Сидорова Анна',
      phone: '+7 999 234-56-78',
      status: 'pending',
      time: '10:30',
      lat: 55.771899,
      lng: 37.597576,
      driverId: '247'
    },
    {
      id: 3,
      zone: 'Северный район',
      address: 'ул. Гагарина, д. 78, кв. 5',
      clientName: 'Петров Сергей',
      phone: '+7 999 345-67-89',
      status: 'delivered',
      time: '09:00',
      lat: 55.783421,
      lng: 37.638174,
      driverId: '247'
    },
    {
      id: 4,
      zone: 'Южный район',
      address: 'ул. Садовая, д. 12',
      clientName: 'Козлов Иван',
      phone: '+7 999 456-78-90',
      status: 'delivered',
      time: '09:30',
      lat: 55.733974,
      lng: 37.587093,
      driverId: '247'
    }
  ]);

  const [currentDriverId, setCurrentDriverId] = useState<string>('247');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Добрый день! Маршрут на сегодня отправлен',
      sender: 'dispatcher',
      time: '08:45'
    },
    {
      id: 2,
      text: 'Принял, выезжаю',
      sender: 'driver',
      time: '08:47'
    },
    {
      id: 3,
      text: 'На Садовой клиент не отвечает',
      sender: 'driver',
      time: '09:25'
    },
    {
      id: 4,
      text: 'Попробуйте ещё раз через 5 минут',
      sender: 'dispatcher',
      time: '09:26'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const tasks = allTasks.filter(task => task.driverId === currentDriverId);
  const availableDrivers = Array.from(new Set(allTasks.map(t => t.driverId)));

  const handleTasksLoad = (loadedTasks: Task[]) => {
    setAllTasks(loadedTasks);
  };

  const updateTaskStatus = (id: number, status: 'delivered' | 'failed') => {
    setAllTasks(allTasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: 'driver',
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewMessage('');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const deliveredTasks = tasks.filter(t => t.status === 'delivered');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">В ожидании</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 hover:bg-green-600">Доставлено</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Не доставлено</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="Truck" size={28} />
              <div>
                <h1 className="text-xl font-bold">Водитель #{currentDriverId}</h1>
                <p className="text-sm opacity-90">Сегодня: {new Date().toLocaleDateString('ru-RU')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsAdmin(!isAdmin)}
                variant="secondary"
                size="sm"
              >
                <Icon name={isAdmin ? "User" : "Settings"} size={18} className="mr-2" />
                {isAdmin ? 'Водитель' : 'Диспетчер'}
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold">{deliveredTasks.length}/{tasks.length}</div>
                <div className="text-xs opacity-90">выполнено</div>
              </div>
            </div>
          </div>
          
          {!isAdmin && availableDrivers.length > 1 && (
            <div className="flex items-center gap-2">
              <Icon name="User" size={20} />
              <Select value={currentDriverId} onValueChange={setCurrentDriverId}>
                <SelectTrigger className="w-[200px] bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.map(driverId => (
                    <SelectItem key={driverId} value={driverId}>
                      Водитель #{driverId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4">
        {isAdmin ? (
          <AdminPanel onTasksLoad={handleTasksLoad} />
        ) : (
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="tasks" className="text-base">
                <Icon name="ClipboardList" size={20} className="mr-2" />
                Задачи
              </TabsTrigger>
              <TabsTrigger value="map" className="text-base">
                <Icon name="Map" size={20} className="mr-2" />
                Карта
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-base">
                <Icon name="BarChart3" size={20} className="mr-2" />
                Отчет
              </TabsTrigger>
            <TabsTrigger value="chat" className="text-base">
              <Icon name="MessageSquare" size={20} className="mr-2" />
              Чат
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="MapPin" size={24} className="text-primary" />
                Маршрут доставки
              </h2>
              <div className="mb-4">
                <DeliveryMap tasks={tasks} />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>В ожидании</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Доставлено</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Не доставлено</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Icon name="MapPin" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg">Текущая зона</h3>
                    <p className="text-sm">Центральный район</p>
                  </div>
                </div>
              </Card>

              <h2 className="text-xl font-bold mt-4">Активные доставки ({pendingTasks.length})</h2>
              
              {pendingTasks.map(task => (
                <Card key={task.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="MapPin" size={18} className="text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">{task.zone}</span>
                        </div>
                        <h3 className="font-bold text-lg">{task.address}</h3>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                        <span>{task.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={16} className="text-muted-foreground" />
                        <a href={`tel:${task.phone}`} className="text-primary hover:underline">
                          {task.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={16} className="text-muted-foreground" />
                        <span>{task.time}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => updateTaskStatus(task.id, 'delivered')}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        size="lg"
                      >
                        <Icon name="CheckCircle" size={20} className="mr-2" />
                        Доставлено
                      </Button>
                      <Button 
                        onClick={() => updateTaskStatus(task.id, 'failed')}
                        variant="destructive"
                        className="flex-1"
                        size="lg"
                      >
                        <Icon name="XCircle" size={20} className="mr-2" />
                        Не доставлено
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="text-center">
                  <Icon name="CheckCircle" size={40} className="mx-auto text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-700">{deliveredTasks.length}</div>
                  <div className="text-sm text-green-600 mt-1">Доставлено</div>
                </div>
              </Card>
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="text-center">
                  <Icon name="XCircle" size={40} className="mx-auto text-red-600 mb-2" />
                  <div className="text-3xl font-bold text-red-700">{failedTasks.length}</div>
                  <div className="text-sm text-red-600 mt-1">Не доставлено</div>
                </div>
              </Card>
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <div className="text-center">
                  <Icon name="Clock" size={40} className="mx-auto text-yellow-600 mb-2" />
                  <div className="text-3xl font-bold text-yellow-700">{pendingTasks.length}</div>
                  <div className="text-sm text-yellow-600 mt-1">В работе</div>
                </div>
              </Card>
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="text-center">
                  <Icon name="Package" size={40} className="mx-auto text-blue-600 mb-2" />
                  <div className="text-3xl font-bold text-blue-700">{tasks.length}</div>
                  <div className="text-sm text-blue-600 mt-1">Всего заказов</div>
                </div>
              </Card>
            </div>

            <h2 className="text-xl font-bold mt-6">История доставок</h2>
            
            {deliveredTasks.map(task => (
              <Card key={task.id} className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                      <span className="font-semibold text-sm text-green-700">{task.time}</span>
                    </div>
                    <h3 className="font-bold">{task.address}</h3>
                    <p className="text-sm text-muted-foreground">{task.clientName}</p>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </Card>
            ))}

            {failedTasks.map(task => (
              <Card key={task.id} className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="XCircle" size={16} className="text-red-600" />
                      <span className="font-semibold text-sm text-red-700">{task.time}</span>
                    </div>
                    <h3 className="font-bold">{task.address}</h3>
                    <p className="text-sm text-muted-foreground">{task.clientName}</p>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Icon name="Headphones" size={24} />
                <div>
                  <h3 className="font-semibold">Диспетчер онлайн</h3>
                  <p className="text-sm">Ответит в течение минуты</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 h-[400px] flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === 'driver'
                            ? 'bg-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'driver' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Написать сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="icon" className="shrink-0">
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </Card>
          </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;