import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/api/adminAPI';

export const AdminDoubts: FC = () => {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await adminAPI.getDoubts();
    setDoubts(data.doubts || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reply = async (id: number) => {
    const text = replyMap[id];
    if (!text) return;
    await adminAPI.replyToDoubt(id, text);
    setReplyMap((m) => ({ ...m, [id]: '' }));
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Doubts & Queries</h1>
        <p className="text-muted-foreground">Review and resolve student doubts</p>
      </div>

      <div className="space-y-3">
        {doubts.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle className="text-lg">{d.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Student: {d.studentName} • Course: {d.courseTitle}</div>
              <div className="text-sm text-muted-foreground">{d.description}</div>
              <div className="text-xs">Status: <span className="font-semibold">{d.status}</span></div>
              {d.adminReply ? (
                <div className="text-sm bg-muted p-2 rounded">Reply: {d.adminReply}</div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your reply"
                    value={replyMap[d.id] || ''}
                    onChange={(e) => setReplyMap((m) => ({ ...m, [d.id]: e.target.value }))}
                  />
                  <Button onClick={() => reply(d.id)}>Reply</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
