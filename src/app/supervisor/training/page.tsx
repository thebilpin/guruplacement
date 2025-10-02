
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Trophy,
  Lightbulb,
  PlayCircle,
  Sparkles,
  FileCheck,
  Search,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

const trainingCourses = [
  {
    id: 'train-1',
    title: 'Effective Mentorship & Coaching',
    category: 'Leadership',
    progress: 100,
    image: 'https://picsum.photos/seed/training-1/600/400',
    imageHint: 'mentorship coaching',
  },
  {
    id: 'train-2',
    title: 'Giving Constructive Feedback',
    category: 'Communication',
    progress: 50,
    image: 'https://picsum.photos/seed/training-2/600/400',
    imageHint: 'constructive feedback',
  },
    {
    id: 'train-3',
    title: 'Mental Health First Aid',
    category: 'Wellness',
    progress: 0,
    image: 'https://picsum.photos/seed/training-3/600/400',
    imageHint: 'mental health first aid',
  },
   {
    id: 'train-4',
    title: 'Conflict Resolution in the Workplace',
    category: 'Leadership',
    progress: 0,
    image: 'https://picsum.photos/seed/training-4/600/400',
    imageHint: 'conflict resolution',
  },
];

export default function SupervisorTrainingPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            Supervisor Training
          </h1>
        </div>
        <p className="text-muted-foreground">
          Complete required training and upload external certificates.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold font-headline text-slate-800">Training Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainingCourses.map(course => (
                    <Card key={course.id} className="card-hover overflow-hidden">
                       <Image
                        src={course.image}
                        alt={course.title}
                        width={600}
                        height={400}
                        data-ai-hint={course.imageHint}
                        className="w-full h-40 object-cover"
                       />
                       <CardHeader>
                            <Badge variant="secondary" className="w-fit">{course.category}</Badge>
                            <CardTitle className="mt-2">{course.title}</CardTitle>
                       </CardHeader>
                       <CardContent>
                            {course.progress > 0 ? (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-slate-600">Progress</span>
                                        <span className="text-sm font-bold text-slate-800">{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2" />
                                    <Button className="w-full mt-4">
                                        {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                                    </Button>
                                </>
                            ) : (
                                <Button className="w-full mt-4">Start Course</Button>
                            )}
                       </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card className="card-hover">
                <CardHeader>
                    <CardTitle>My Certificates</CardTitle>
                    <CardDescription>Manage your completed training certificates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <FileCheck className="h-5 w-5 text-green-500"/>
                            <span className="font-medium text-sm">Effective Mentorship & Coaching</span>
                        </li>
                    </ul>
                    <Button className="w-full mt-4">
                        <Upload className="mr-2 h-4 w-4"/>
                        Upload External Certificate
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
