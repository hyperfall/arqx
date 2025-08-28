import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Twitter, Mail, Hammer } from "lucide-react";

export default function About() {
  const features = [
    "Natural language tool generation",
    "Real-time tool customization", 
    "Batch file processing",
    "Multiple output formats",
    "Privacy-focused local processing",
    "Modular theming system",
  ];

  const roadmapItems = [
    { title: "AI-Powered Tool Generation", status: "planned", quarter: "Q2 2024" },
    { title: "Cloud Processing Pipeline", status: "planned", quarter: "Q3 2024" },
    { title: "Collaborative Tool Sharing", status: "planned", quarter: "Q3 2024" },
    { title: "Advanced Analytics", status: "planned", quarter: "Q4 2024" },
    { title: "Mobile App", status: "planned", quarter: "Q1 2025" },
  ];

  return (
    <div className="space-y-8" data-testid="about-page">
      {/* Hero Section */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Hammer className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">TOOLFORGE</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The next-generation platform for building and using tools with natural language. 
          Transform your ideas into powerful utilities in seconds.
        </p>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About the Project</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            TOOLFORGE was born from the vision of democratizing tool creation. We believe that everyone 
            should be able to build the utilities they need without requiring deep technical knowledge. 
            By leveraging natural language processing and intuitive design, we're making tool creation 
            as simple as describing what you want to accomplish.
          </p>
          <p className="text-muted-foreground">
            Our platform focuses on privacy and local processing, ensuring your data stays secure while 
            providing the flexibility to create, customize, and share tools with the community.
          </p>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle>Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmapItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.quarter}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links & Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Connect & Contribute</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Community</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Repository
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Twitter className="w-4 h-4 mr-2" />
                  Follow Updates
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Support</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-muted-foreground">
        <p>&copy; 2024 TOOLFORGE. Built with ❤️ for makers and creators.</p>
      </div>
    </div>
  );
}
