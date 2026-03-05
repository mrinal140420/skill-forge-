import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const CourseContent: FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold mb-4">Course Content</h1>
          <p className="text-muted-foreground">Course content interface - currently a placeholder.</p>
        </CardContent>
      </Card>
    </div>
  );
};
