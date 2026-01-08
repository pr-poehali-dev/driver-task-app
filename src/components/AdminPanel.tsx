import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

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

interface AdminPanelProps {
  onTasksLoad: (tasks: Task[]) => void;
}

const AdminPanel = ({ onTasksLoad }: AdminPanelProps) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseExcelFile = async () => {
    if (!file) {
      toast({
        title: "Ошибка",
        description: "Выберите Excel файл для загрузки",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedTasks: Task[] = jsonData.map((row: any, index: number) => ({
        id: index + 1,
        driverId: String(row['ID Водителя'] || row['driverId'] || '247'),
        zone: String(row['Зона'] || row['zone'] || 'Центральный район'),
        address: String(row['Адрес'] || row['address'] || ''),
        clientName: String(row['Клиент'] || row['clientName'] || ''),
        phone: String(row['Телефон'] || row['phone'] || ''),
        time: String(row['Время'] || row['time'] || '10:00'),
        lat: Number(row['Широта'] || row['lat'] || 55.751244 + Math.random() * 0.05),
        lng: Number(row['Долгота'] || row['lng'] || 37.618423 + Math.random() * 0.05),
        status: 'pending' as const
      }));

      onTasksLoad(parsedTasks);
      
      toast({
        title: "Успешно!",
        description: `Загружено ${parsedTasks.length} заказов`,
      });

      setFile(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось прочитать файл. Проверьте формат.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'ID Водителя': '247',
        'Зона': 'Центральный район',
        'Адрес': 'ул. Ленина, д. 45, кв. 12',
        'Клиент': 'Иванов Петр',
        'Телефон': '+7 999 123-45-67',
        'Время': '10:00',
        'Широта': 55.751244,
        'Долгота': 37.618423
      },
      {
        'ID Водителя': '247',
        'Зона': 'Центральный район',
        'Адрес': 'пр. Мира, д. 23',
        'Клиент': 'Сидорова Анна',
        'Телефон': '+7 999 234-56-78',
        'Время': '10:30',
        'Широта': 55.771899,
        'Долгота': 37.597576
      },
      {
        'ID Водителя': '248',
        'Зона': 'Северный район',
        'Адрес': 'ул. Гагарина, д. 78, кв. 5',
        'Клиент': 'Петров Сергей',
        'Телефон': '+7 999 345-67-89',
        'Время': '09:00',
        'Широта': 55.783421,
        'Долгота': 37.638174
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Маршруты');
    
    XLSX.writeFile(wb, 'template_routes.xlsx');
    
    toast({
      title: "Шаблон скачан",
      description: "Заполните файл и загрузите обратно",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="Upload" size={28} className="text-primary" />
            Панель диспетчера
          </h2>
          <p className="text-muted-foreground">
            Загрузите Excel файл с маршрутами доставки
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">Excel файл с маршрутами</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon name="FileSpreadsheet" size={16} />
                {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={parseExcelFile}
              className="flex-1"
              size="lg"
              disabled={!file}
            >
              <Icon name="Upload" size={20} className="mr-2" />
              Загрузить маршруты
            </Button>
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              size="lg"
            >
              <Icon name="Download" size={20} className="mr-2" />
              Скачать шаблон
            </Button>
          </div>
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-900">
            <Icon name="Info" size={20} />
            Формат файла
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>ID Водителя</strong> — номер водителя (например, 247)</li>
            <li>• <strong>Зона</strong> — район доставки</li>
            <li>• <strong>Адрес</strong> — полный адрес доставки</li>
            <li>• <strong>Клиент</strong> — ФИО получателя</li>
            <li>• <strong>Телефон</strong> — контактный номер</li>
            <li>• <strong>Время</strong> — плановое время доставки</li>
            <li>• <strong>Широта / Долгота</strong> — координаты (опционально)</li>
          </ul>
        </Card>
      </div>
    </Card>
  );
};

export default AdminPanel;
