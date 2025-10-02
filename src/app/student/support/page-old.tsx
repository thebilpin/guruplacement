
import UserSupportPage from '@/components/user-support-page';

export default function StudentSupportPage() {
  return <UserSupportPage />;
}
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';

const faqItems = [
  {
    question: 'How do I log my placement hours?',
    answer:
      'You can log your hours through the "My Placements" page. Navigate to your current placement and use the "Log Hours" quick action. You will need to enter the date, start time, end time, and a brief description of your activities.',
  },
  {
    question: 'What should I do if my supervisor is unresponsive?',
    answer:
      'If you are having trouble reaching your supervisor, first try contacting them through the platform\'s messaging system. If you still do not receive a response within 48 hours, please contact your RTO coordinator for assistance.',
  },
  {
    question: 'How do I upload a new certificate or document?',
    answer:
      'Go to your "Profile" page. Under the "Document Management" section, click the "Upload New Document" button. You will be prompted to select the file from your device and categorize it.',
  },
    {
    question: 'Can I change my placement after it has started?',
    answer:
      'Changing a placement after it has begun is generally not permitted except in extenuating circumstances. Please discuss any significant issues with your RTO coordinator to explore your options.',
  },
];

export default function SupportCommunityPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline text-slate-800">
          Support & Community
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Find answers, connect with peers, and get the help you need to
          succeed.
        </p>
      </header>

      {/* Knowledgebase Search */}
      <Card className="mb-8 max-w-3xl mx-auto card-hover">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <CardTitle>Knowledge Base</CardTitle>
          </div>
          <CardDescription>
            Have a question? Search our articles for an instant answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              id="search"
              placeholder="e.g., 'How to submit a timesheet'"
              className="pl-10 h-12 text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Button className="absolute right-2 top-1/2 -translate-y-1/2">
                Search
             </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: FAQ */}
        <div className="lg:col-span-2">
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-primary" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Support Channels */}
        <div className="space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Community Forum</CardTitle>
              </div>
              <CardDescription>
                Ask questions and share your experience with other students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" /> Visit Forums
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover bg-primary text-primary-foreground">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 " />
                <CardTitle>AI Helpbot</CardTitle>
              </div>
              <CardDescription className="text-primary-foreground/80">
                Get instant answers from your personal AI assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                 Chat with AI
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
               <div className="flex items-center gap-3">
                <LifeBuoy className="h-6 w-6 text-primary" />
                <CardTitle>Contact Support</CardTitle>
              </div>
              <CardDescription>
                Can't find what you're looking for? Reach out to us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Headphones className="h-4 w-4" /> Live Chat
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" /> Email Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
