import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Check, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// Simple button component
const Button = ({ children, className = '', ...props }) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Simple input component
const Input = ({ className = '', ...props }) => (
  <input 
    className={`border rounded-md px-3 py-2 w-full ${className}`}
    {...props}
  />
);

// Simple card components
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg overflow-hidden flex flex-col ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 flex-1 ${className}`}>
    {children}
  </div>
);

// Simple badge component
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

// Simple toast notification
const toast = {
  success: (message) => console.log(`SUCCESS: ${message}`),
  error: (message) => console.error(`ERROR: ${message}`),
};

const AIChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI Sales Assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process the message and get AI response
      const response = await processMessage(input);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'ai',
        timestamp: new Date(),
        data: response.data,
        actions: response.actions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process user message and generate response
  const processMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for pending counts query
    if (lowerMessage.includes('how many') || lowerMessage.includes('pending') || lowerMessage.includes('count')) {
      return await handlePendingCountsQuery(lowerMessage);
    }
    
    // Check for approval status
    if (lowerMessage.includes('approval level') || 
        lowerMessage.includes('stage') || 
        lowerMessage.includes('next approver')) {
      return await handleApprovalStatusQuery(lowerMessage);
    }
    
    // Check for personal tasks
    if (lowerMessage.includes('my pending') || 
        lowerMessage.includes('my tasks') || 
        lowerMessage.includes('pending with me')) {
      return await handlePersonalTasksQuery();
    }
    
    // Handle direct approvals
    if (lowerMessage.startsWith('approve') || 
        lowerMessage.includes('approve ')) {
      return await handleDirectApproval(lowerMessage);
    }
    
    // Default response
    return {
      text: 'I can help you with:\n- Checking pending items\n- Approval status\n- Your tasks\n- Approving requests\n\nTry asking:\n"How many leads are pending?"\n"What is pending with me?"\n"Approve Lead 1023"',
    };
  };

  // Handle pending counts query
  const handlePendingCountsQuery = async (message) => {
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch('/api/ai-chat/pending-counts');
      // const data = await response.json();
      
      // Mock data for now
      const mockData = {
        leads: 5,
        opportunities: 3,
        sows: 2,
        approvals: 4
      };
      
      let responseText = '';
      
      if (message.includes('lead')) {
        responseText = `Leads Pending: ${mockData.leads}`;
      } else if (message.includes('opportunit')) {
        responseText = `Opportunities Pending: ${mockData.opportunities}`;
      } else if (message.includes('sow')) {
        responseText = `SOWs Pending: ${mockData.sows}`;
      } else if (message.includes('approval')) {
        responseText = `Approvals Pending: ${mockData.approvals}`;
      } else {
        responseText = `Pending Items:\n` +
          `• Leads: ${mockData.leads}\n` +
          `• Opportunities: ${mockData.opportunities}\n` +
          `• SOWs: ${mockData.sows}\n` +
          `• Approvals: ${mockData.approvals}`;
      }
      
      return {
        text: responseText,
        actions: [
          { label: 'View Leads', action: 'navigate', target: '/leads' },
          { label: 'View Opportunities', action: 'navigate', target: '/opportunities' },
          { label: 'View SOWs', action: 'navigate', target: '/sows' },
        ]
      };
    } catch (error) {
      console.error('Error fetching pending counts:', error);
      return {
        text: 'Sorry, I couldn\'t fetch the pending counts right now. Please try again later.',
        isError: true
      };
    }
  };

  // Handle approval status query
  const handleApprovalStatusQuery = async (message) => {
    try {
      // Extract ID from message if present
      const idMatch = message.match(/\d+/);
      const id = idMatch ? idMatch[0] : null;
      
      if (!id) {
        return {
          text: 'Please provide an ID for the request. For example: "What\'s the status of Lead 1023?"',
          isError: true
        };
      }
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/ai-chat/approval-status/${id}`);
      // const data = await response.json();
      
      // Mock data
      const mockData = {
        id,
        type: message.includes('lead') ? 'Lead' : message.includes('sow') ? 'SOW' : 'Opportunity',
        currentLevel: 2,
        totalLevels: 3,
        nextApprover: 'John Doe',
        nextApproverRole: 'Sales Manager',
        status: 'Pending',
        requestedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        timeline: [
          { level: 1, approver: 'Jane Smith', status: 'Approved', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { level: 2, approver: 'John Doe', status: 'Pending', date: null },
          { level: 3, approver: 'Alex Johnson', status: 'Pending', date: null },
        ]
      };
      
      const responseText = `**${mockData.type} #${mockData.id} Approval Status**\n\n` +
        `• **Current Level**: ${mockData.currentLevel} of ${mockData.totalLevels}\n` +
        `• **Next Approver**: ${mockData.nextApprover} (${mockData.nextApproverRole})\n` +
        `• **Status**: ${mockData.status}\n` +
        `• **Requested On**: ${format(mockData.requestedOn, 'MMM d, yyyy')}\n\n` +
        `**Approval Timeline**:\n` +
        mockData.timeline.map(step => 
          `• Level ${step.level}: ${step.approver} - ${step.status} ${step.date ? format(step.date, 'MMM d') : ''}`
        ).join('\n');
      
      return {
        text: responseText,
        actions: [
          { label: 'View Details', action: 'navigate', target: `/${mockData.type.toLowerCase()}s/${id}` },
          { label: 'Send Reminder', action: 'remind', target: id }
        ]
      };
    } catch (error) {
      console.error('Error fetching approval status:', error);
      return {
        text: 'Sorry, I couldn\'t fetch the approval status right now. Please try again later.',
        isError: true
      };
    }
  };

  // Handle personal tasks query
  const handlePersonalTasksQuery = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/ai-chat/my-tasks');
      // const data = await response.json();
      
      // Mock data
      const mockTasks = [
        { id: 'LEAD-1023', type: 'Lead', title: 'New Enterprise Lead', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), priority: 'High' },
        { id: 'SOW-558', type: 'SOW', title: 'Renewal Contract - ABC Corp', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), priority: 'Medium' },
        { id: 'OPP-789', type: 'Opportunity', title: 'Upsell Opportunity - XYZ Inc', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), priority: 'Low' },
      ];
      
      const responseText = `**Your Pending Items**\n\n` +
        mockTasks.map(task => 
          `• **${task.type} ${task.id}**: ${task.title}\n` +
          `  _${format(task.date, 'MMM d, yyyy')} • Priority: ${task.priority}_`
        ).join('\n\n');
      
      return {
        text: responseText,
        data: mockTasks,
        actions: mockTasks.map(task => ({
          label: `View ${task.type} ${task.id}`,
          action: 'navigate',
          target: `/${task.type.toLowerCase()}s/${task.id.split('-')[1]}`
        }))
      };
    } catch (error) {
      console.error('Error fetching personal tasks:', error);
      return {
        text: 'Sorry, I couldn\'t fetch your tasks right now. Please try again later.',
        isError: true
      };
    }
  };

  // Handle direct approval
  const handleDirectApproval = async (message) => {
    try {
      // Extract ID from message
      const idMatch = message.match(/\d+/);
      if (!idMatch) {
        return {
          text: 'Please provide an ID. For example: "Approve Lead 1023"',
          isError: true
        };
      }
      
      const id = idMatch[0];
      const type = message.includes('lead') ? 'Lead' : 
                  message.includes('sow') ? 'SOW' : 
                  message.includes('opportunity') ? 'Opportunity' : 'Item';
      
      // Return a confirmation message with actions
      return {
        text: `Are you sure you want to approve ${type} #${id}?`,
        actions: [
          { 
            label: 'Yes, Approve', 
            action: 'approve', 
            target: id,
            type: type.toLowerCase()
          },
          { 
            label: 'No, Cancel', 
            action: 'message',
            text: 'Approval cancelled.'
          },
          { 
            label: 'View Details', 
            action: 'navigate',
            target: `/${type.toLowerCase()}s/${id}`
          }
        ]
      };
    } catch (error) {
      console.error('Error processing approval request:', error);
      return {
        text: 'Sorry, I couldn\'t process your approval request. Please try again.',
        isError: true
      };
    }
  };

  // Handle action button clicks
  const handleAction = async (action) => {
    switch (action.action) {
      case 'navigate':
        // In a real app, you would use your router here
        window.location.href = action.target;
        break;
        
      case 'approve':
        // Add a user message
        const userMessage = {
          id: Date.now(),
          text: `Approve ${action.type} ${action.target}`,
          sender: 'user',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Show processing message
        const processingId = Date.now() + 1;
        setMessages(prev => [...prev, {
          id: processingId,
          text: `Processing approval for ${action.type} ${action.target}...`,
          sender: 'ai',
          timestamp: new Date(),
          isLoading: true
        }]);
        
        try {
          // TODO: Replace with actual API call
          // await fetch(`/api/${action.type}s/${action.target}/approve`, {
          //   method: 'POST',
          //   headers: { 'Authorization': `Bearer ${user.token}` }
          // });
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Remove processing message and add success message
          setMessages(prev => [
            ...prev.filter(m => m.id !== processingId),
            {
              id: processingId + 1,
              text: `✅ Successfully approved ${action.type} ${action.target}.`,
              sender: 'ai',
              timestamp: new Date(),
              isSuccess: true
            }
          ]);
          
          toast.success(`Approved ${action.type} ${action.target}`);
        } catch (error) {
          console.error('Error approving:', error);
          setMessages(prev => [
            ...prev.filter(m => m.id !== processingId),
            {
              id: processingId + 1,
              text: `❌ Failed to approve ${action.type} ${action.target}. Please try again.`,
              sender: 'ai',
              timestamp: new Date(),
              isError: true
            }
          ]);
          toast.error(`Failed to approve ${action.type}`);
        }
        break;
        
      case 'message':
        // Add a simple AI message
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: action.text,
          sender: 'ai',
          timestamp: new Date()
        }]);
        break;
        
      default:
        console.warn('Unknown action:', action);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-xl z-50">
      <CardHeader className="bg-primary text-primary-foreground p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">AI Sales Assistant</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.isError 
                        ? 'bg-destructive/10 text-destructive-foreground border border-destructive/20' 
                        : message.isSuccess
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-muted'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {message.text}
                      
                      {message.data && (
                        <div className="mt-2 space-y-2">
                          {message.data.map((item, index) => (
                            <div key={index} className="p-2 border rounded bg-background text-foreground">
                              <div className="font-medium">{item.title || `${item.type} ${item.id}`}</div>
                              {item.priority && (
                                <Badge 
                                  variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'warning' : 'default'}
                                  className="text-xs mt-1"
                                >
                                  {item.priority}
                                </Badge>
                              )}
                              {item.date && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(item.date), 'MMM d, yyyy')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant={action.action === 'approve' ? 'default' : 'outline'}
                              size="sm"
                              className="w-full justify-start text-left text-sm"
                              onClick={() => handleAction(action)}
                            >
                              {action.action === 'approve' && <Check className="mr-2 h-4 w-4" />}
                              {action.action === 'navigate' && <ChevronRight className="mr-2 h-4 w-4" />}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Try: "How many leads are pending?" or "Approve Lead 1023"
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIChatBox;
