"use client";

import { useState, useMemo, type FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Utensils, Trash2, X, DollarSign, Users, PlusCircle } from 'lucide-react';

type Item = {
  id: string;
  name: string;
  price: number;
  consumers: Set<string>;
};

export const MealSplitter: FC = () => {
  const { toast } = useToast();
  const [friends, setFriends] = useState<string[]>(['You']);
  const [items, setItems] = useState<Item[]>([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleAddFriend = () => {
    const trimmedName = newFriendName.trim();
    if (trimmedName && !friends.includes(trimmedName)) {
      setFriends([...friends, trimmedName]);
      setNewFriendName('');
    } else if (friends.includes(trimmedName)) {
      toast({
        title: "Friend already exists",
        description: `"${trimmedName}" is already on the list.`,
        variant: "destructive",
      });
    } else if (!trimmedName) {
        toast({
        title: "Invalid Name",
        description: "Friend's name cannot be empty.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveFriend = (nameToRemove: string) => {
    if (nameToRemove === 'You') return;
    setFriends(friends.filter(friend => friend !== nameToRemove));
    setItems(currentItems => currentItems.map(item => {
      const newConsumers = new Set(item.consumers);
      newConsumers.delete(nameToRemove);
      return { ...item, consumers: newConsumers };
    }));
  };

  const handleAddItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);
    if (name && !isNaN(price) && price > 0) {
      const newItem: Item = {
        id: crypto.randomUUID(),
        name,
        price,
        consumers: new Set(),
      };
      setItems(prevItems => [...prevItems, newItem]);
      setNewItemName('');
      setNewItemPrice('');
    } else {
       toast({
        title: "Invalid Item",
        description: "Please enter a valid name and a price greater than 0.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = (idToRemove: string) => {
    setItems(items.filter(item => item.id !== idToRemove));
  };
  
  const handleConsumerToggle = (itemId: string, friendName: string, isChecked: boolean | 'indeterminate') => {
      if (typeof isChecked !== 'boolean') return;
      
      setItems(currentItems => currentItems.map(item => {
        if (item.id === itemId) {
          const newConsumers = new Set(item.consumers);
          if (isChecked) {
            newConsumers.add(friendName);
          } else {
            newConsumers.delete(friendName);
          }
          return { ...item, consumers: newConsumers };
        }
        return item;
      }));
  };

  const results = useMemo(() => {
    const bill = new Map<string, number>(friends.map(f => [f, 0]));
    let totalBill = 0;

    items.forEach(item => {
      totalBill += item.price;
      if (item.consumers.size > 0) {
        const costPerPerson = item.price / item.consumers.size;
        item.consumers.forEach(consumerName => {
          if (bill.has(consumerName)) {
            bill.set(consumerName, bill.get(consumerName)! + costPerPerson);
          }
        });
      }
    });

    return { bill: Array.from(bill.entries()), totalBill };
  }, [items, friends]);

  return (
    <div className="container mx-auto max-w-7xl">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">MealSplitter</h1>
        <p className="text-muted-foreground mt-2 text-lg">Easily split meal costs with friends.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Users className="text-primary"/> Friends</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex gap-2 mb-4">
                  <Input 
                    type="text" 
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                    placeholder="Enter friend's name"
                  />
                  <Button onClick={handleAddFriend}><UserPlus className="mr-2 h-4 w-4"/> Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {friends.map(friend => (
                    <Badge key={friend} variant="secondary" className="text-base py-1 px-3 flex items-center gap-1">
                      {friend}
                      {friend !== 'You' && (
                        <button onClick={() => handleRemoveFriend(friend)} className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Utensils className="text-primary"/> Add Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <Input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name (e.g., Pizza)"
                />
                <Input 
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Price (e.g., 25.50)"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
              </CardContent>
              <CardFooter>
                 <Button onClick={handleAddItem} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Add Item to Bill</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Menu &amp; Consumer Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background hover:bg-accent/50 transition-colors animate-in fade-in-0" style={{animationDelay: `${index * 50}ms`}}>
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {friends.map(friend => (
                          <div key={`${item.id}-${friend}`} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${item.id}-${friend}`}
                              checked={item.consumers.has(friend)}
                              onCheckedChange={(checked) => handleConsumerToggle(item.id, friend, checked)}
                            />
                            <Label htmlFor={`${item.id}-${friend}`}>{friend}</Label>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-muted-foreground hover:text-destructive self-start md:self-center">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>No items added yet.</p>
                    <p className="text-sm">Use the form above to add menu items to the bill.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><DollarSign className="text-primary"/> The Split</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 && friends.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Bill</p>
                    <p className="text-4xl font-bold font-headline">${results.totalBill.toFixed(2)}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {results.bill.map(([friend, amount]) => (
                      <div key={friend} className="flex justify-between items-center p-3 rounded-md hover:bg-accent/50 transition-colors">
                        <span className="font-medium text-lg">{friend}</span>
                        <span className="font-mono font-semibold text-lg">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>Results will be shown here.</p>
                    <p className="text-sm">Add friends and items to calculate the split.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
