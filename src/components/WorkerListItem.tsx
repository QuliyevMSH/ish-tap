
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkerListItemProps {
  id: string;
  name: string;
  profession: string;
  skills: string[];
  location: string;
  postedTime: string;
}

const WorkerListItem: React.FC<WorkerListItemProps> = ({
  id,
  name,
  profession,
  skills,
  location,
  postedTime
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/workers/${id}`);
  };
  
  return (
    <Card 
      className="mb-3 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border-border/40 dark:border-border/30" 
      onClick={handleClick}
    >
      <div className="p-4 border-none dark:border-white border-[0.5px] rounded-[20px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-foreground">{name}</h3>
            <p className="text-muted-foreground mb-2">{profession}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="font-normal bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-y-2">
              <div className="flex items-center text-muted-foreground text-sm mr-4">
                <MapPin className="w-4 h-4 mr-1 text-secondary" />
                <span>{location}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="w-4 h-4 mr-1 text-yellow-600" />
                <span>{postedTime}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full flex-shrink-0 transition-all duration-300">
            <User className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WorkerListItem;
