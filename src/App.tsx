import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthPage } from '@/components/auth/AuthPage';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { ExecutionPanel } from '@/components/workflow/ExecutionPanel';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Zap, ChevronLeft, User, LogOut, Settings, BookOpen } from 'lucide-react';
import { FREE_LLM_APIS } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function MainApp() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (selectedWorkflowId) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWorkflowId(null)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Workflows
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">FlowMind AI</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiDocs(true)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              API Docs
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <WorkflowCanvas workflowId={selectedWorkflowId} />
          <ExecutionPanel workflowId={selectedWorkflowId} />
        </div>

        {/* API Docs Dialog */}
        <Dialog open={showApiDocs} onOpenChange={setShowApiDocs}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Free LLM API Integration Guide</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <p className="text-muted-foreground">
                FlowMind AI supports multiple free LLM APIs. Here's how to get started with each:
              </p>

              {FREE_LLM_APIS.map((api) => (
                <div key={api.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{api.name}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(api.keyUrl, '_blank')}
                    >
                      Get API Key
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {api.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {api.models.map((model) => (
                        <span
                          key={model.id}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {model.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">How to Use</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Click on an LLM node in your workflow</li>
                  <li>Select your preferred provider and model</li>
                  <li>Enter your API key (get one from the provider's website)</li>
                  <li>Write your system prompt</li>
                  <li>Test the connection to verify your API key</li>
                  <li>Save and run your workflow!</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">FlowMind AI</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Workflow Automation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowApiDocs(true)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            API Docs
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <WorkflowList onSelectWorkflow={setSelectedWorkflowId} />
      </main>

      {/* API Docs Dialog */}
      <Dialog open={showApiDocs} onOpenChange={setShowApiDocs}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Free LLM API Integration Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <p className="text-muted-foreground">
              FlowMind AI supports multiple free LLM APIs. Here's how to get started with each:
            </p>

            {FREE_LLM_APIS.map((api) => (
              <div key={api.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{api.name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(api.keyUrl, '_blank')}
                  >
                    Get API Key
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {api.description}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Available Models:</p>
                  <div className="flex flex-wrap gap-2">
                    {api.models.map((model) => (
                      <span
                        key={model.id}
                        className="text-xs bg-muted px-2 py-1 rounded"
                      >
                        {model.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold mb-2">How to Use</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Create a new workflow or open an existing one</li>
                <li>Add an LLM node from the left panel</li>
                <li>Click the settings icon on the LLM node</li>
                <li>Select your preferred provider and model</li>
                <li>Enter your API key (get one from the provider's website)</li>
                <li>Write your system prompt</li>
                <li>Test the connection to verify your API key</li>
                <li>Save and run your workflow!</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <MainApp /> : <AuthPage />;
}

export default App;
