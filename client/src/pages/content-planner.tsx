import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContentModal } from "@/components/content-modal";
import { type ContentItem } from "@shared/schema";
import { Plus, ChevronLeft, ChevronRight, Download, User, Crown, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const localizer = momentLocalizer(moment);

// Event type for react-big-calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ContentItem;
}

const platformColors = {
  social: "hsl(262 83% 58%)",
  email: "hsl(172 76% 40%)",
  blog: "hsl(239 84% 67%)",
};

const statusColors = {
  draft: "hsl(43 96% 56%)",
  scheduled: "hsl(142 76% 36%)",
  posted: "hsl(215 25% 27%)",
};

export default function ContentPlanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<string>(Views.MONTH);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: contentItems = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/export/csv", {
        credentials: "include"
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content-calendar.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Calendar exported as CSV successfully!",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle test reminder (premium feature)
  const handleTestReminder = async () => {
    if ((user as any)?.subscriptionStatus !== 'active') {
      toast({
        title: "Premium Feature",
        description: "Email reminders are only available for premium subscribers.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/test-reminder", {
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Test reminder sent to your email!",
        });
      } else {
        throw new Error('Reminder failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Transform content items into calendar events
  const events: CalendarEvent[] = (contentItems || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    start: new Date(item.scheduledDate),
    end: new Date(item.scheduledDate),
    resource: item,
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    setEditingContent(event.resource);
    setModalOpen(true);
  };

  const handleNewContent = () => {
    setEditingContent(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingContent(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const platform = event.resource.platform as keyof typeof platformColors;
    return {
      style: {
        backgroundColor: platformColors[platform],
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
                Content Planner
              </h1>
              {(user as any)?.subscriptionStatus === 'active' && (
                <Badge variant="default" className="ml-3 flex items-center" data-testid="premium-badge">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {/* Export Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="export-menu">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportCSV} data-testid="export-csv">
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      if ((user as any)?.subscriptionStatus !== 'active') {
                        toast({
                          title: "Premium Feature",
                          description: "PDF export is only available for premium subscribers.",
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Coming Soon",
                          description: "PDF export will be available soon!",
                        });
                      }
                    }}
                    data-testid="export-pdf"
                  >
                    Export as PDF {(user as any)?.subscriptionStatus !== 'active' && '(Premium)'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Test Reminder Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestReminder}
                data-testid="test-reminder"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Reminder
              </Button>

              {/* New Content Button */}
              <Button onClick={handleNewContent} data-testid="button-new-content">
                <Plus className="w-4 h-4 mr-2" />
                New Content
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="user-menu">
                    <User className="w-4 h-4 mr-2" />
                    {(user as any)?.firstName || (user as any)?.email || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild data-testid="manage-subscription">
                    <a href="/subscription">Manage Subscription</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild data-testid="logout">
                    <a href="/api/logout">Log Out</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Controls */}
        <Card className="mb-6">
          <CardContent className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <h2 className="text-lg font-semibold text-foreground" data-testid="calendar-month">
                  {moment(currentDate).format("MMMM YYYY")}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(moment(currentDate).subtract(1, currentView === Views.MONTH ? 'month' : currentView === Views.WEEK ? 'week' : 'day').toDate())}
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(moment(currentDate).add(1, currentView === Views.MONTH ? 'month' : currentView === Views.WEEK ? 'week' : 'day').toDate())}
                    data-testid="button-next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Button
                    variant={currentView === Views.MONTH ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewChange(Views.MONTH)}
                    data-testid="button-month-view"
                  >
                    Month
                  </Button>
                  <Button
                    variant={currentView === Views.WEEK ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewChange(Views.WEEK)}
                    data-testid="button-week-view"
                  >
                    Week
                  </Button>
                  <Button
                    variant={currentView === Views.DAY ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewChange(Views.DAY)}
                    data-testid="button-day-view"
                  >
                    Day
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center" data-testid="legend-social">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: platformColors.social }}
                    ></div>
                    <span className="text-muted-foreground">Social</span>
                  </div>
                  <div className="flex items-center" data-testid="legend-email">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: platformColors.email }}
                    ></div>
                    <span className="text-muted-foreground">Email</span>
                  </div>
                  <div className="flex items-center" data-testid="legend-blog">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: platformColors.blog }}
                    ></div>
                    <span className="text-muted-foreground">Blog</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardContent className="p-6">
            <div className="calendar-container" style={{ height: "600px" }} data-testid="calendar-view">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                view={currentView as any}
                onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                popup
                showMultiDayTimes
                step={60}
                showAllEvents
                toolbar={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Panel */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4" data-testid="stats-title">Quick Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center" data-testid="stat-total">
                <div className="text-2xl font-bold text-primary">{contentItems?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Content</div>
              </div>
              <div className="text-center" data-testid="stat-scheduled">
                <div className="text-2xl font-bold text-green-600">
                  {contentItems?.filter((item: any) => item.status === 'scheduled').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
              <div className="text-center" data-testid="stat-draft">
                <div className="text-2xl font-bold text-yellow-600">
                  {contentItems?.filter((item: any) => item.status === 'draft').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <ContentModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        editingContent={editingContent}
      />
    </div>
  );
}
