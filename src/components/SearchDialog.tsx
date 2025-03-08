
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search as SearchIcon, X, Loader2, Briefcase, User } from 'lucide-react';
import { SearchService, SearchResultType } from '@/services/SearchService';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ trigger, className }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      const searchResults = await SearchService.searchAll(debouncedQuery);
      setResults(searchResults);
      setIsLoading(false);
    };
    
    performSearch();
  }, [debouncedQuery]);
  
  const handleResultClick = (result: SearchResultType) => {
    setOpen(false);
    
    switch (result.type) {
      case 'profile':
        navigate(`/profile/${result.id}`);
        break;
      case 'job':
        navigate(`/jobs/${result.id}`);
        break;
      case 'worker':
        navigate(`/workers/${result.id}`);
        break;
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      clearSearch();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className={className}
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Axtarış</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border rounded-md">
          <div className="px-3 py-2">
            <SearchIcon className="h-4 w-4 opacity-50" />
          </div>
          <Input
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="İstifadəçi, iş elanı və ya işçi axtar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <Button 
              variant="ghost" 
              className="px-3 py-2" 
              onClick={clearSearch}
            >
              <X className="h-4 w-4 opacity-50" />
            </Button>
          )}
        </div>
        
        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <div 
                  key={`${result.type}-${result.id}`}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === 'profile' ? (
                    <Avatar className="h-10 w-10">
                      {result.avatar_url ? (
                        <AvatarImage src={result.avatar_url} />
                      ) : null}
                      <AvatarFallback>
                        {result.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : result.type === 'job' ? (
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              Axtarış üzrə heç bir nəticə tapılmadı
            </div>
          ) : null}
          
          {query.length > 0 && query.length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              Axtarış üçün ən azı 2 simvol daxil edin
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
