
import React from 'react';
import { Card } from '@/components/ui/card';
import { Briefcase, Clock, MapPin, Banknote, Clock3, Building, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobListItemProps {
  id: string;
  title: string;
  company: string;
  location: string;
  experience_level?: string;
  salary_range?: string;
  work_mode?: string;
  postedTime: string;
  postedBy?: string;
  userId?: string;
}

const JobListItem: React.FC<JobListItemProps> = ({
  id,
  title,
  company,
  location,
  experience_level,
  salary_range,
  work_mode,
  postedTime,
  postedBy,
  userId
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/jobs/${id}`);
  };
  
  const handleUserClick = (e: React.MouseEvent) => {
    if (userId) {
      e.stopPropagation();
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <Card onClick={handleClick} className="mb-3 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border-border/40 dark:border-border/30 rounded-[20px]">
      <div className="p-4 dark:border-white border-[0.5px] rounded-[20px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-foreground">{title}</h3>
            <p className="text-muted-foreground mb-2">{company}</p>
            
            <div className="flex flex-wrap gap-y-2 gap-x-4 mb-2">
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1 text-secondary" />
                <span>{location}</span>
              </div>
              
              {experience_level && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Building className="w-4 h-4 mr-1 text-primary" />
                  <span>{experience_level}</span>
                </div>
              )}
              
              {salary_range && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Banknote className="w-4 h-4 mr-1 text-green-600" />
                  <span>{salary_range}</span>
                </div>
              )}
              
              {work_mode && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Clock3 className="w-4 h-4 mr-1 text-secondary" />
                  <span>{work_mode}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="w-4 h-4 mr-1 text-yellow-600" />
                <span>{postedTime}</span>
              </div>
              
              {postedBy && userId && (
                <div 
                  className="flex items-center text-sm text-primary hover:text-primary/80 cursor-pointer" 
                  onClick={handleUserClick}
                >
                  <User className="w-4 h-4 mr-1" />
                  <span>{postedBy}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full flex-shrink-0 transition-all duration-300">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobListItem;
