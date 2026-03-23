import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageSquareReply, AlertCircle, History } from 'lucide-react';
import { adminAPI } from '@/api/adminAPI';

export const AdminDoubts: FC = () => {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDoubts();
      setDoubts(data.doubts || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reply = async (id: number) => {
    const text = replyMap[id];
    if (!text) return;
    setReplyingId(id);
    setError(null);
    setSuccess(null);
    try {
      await adminAPI.replyToDoubt(id, text);
      setReplyMap((m) => ({ ...m, [id]: '' }));
      setSuccess('Reply sent and doubt marked resolved.');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reply to doubt');
    } finally {
      setReplyingId(null);
    }
  };

  const activeDoubts = doubts.filter((d) => (d.status || '').toUpperCase() === 'OPEN');
  const historyDoubts = doubts.filter((d) => (d.status || '').toUpperCase() !== 'OPEN');

  const getStatusBadgeClass = (status: string) => {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'OPEN') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (normalized === 'RESOLVED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-slate-200 text-slate-700 border-slate-300';
  };

  const renderDoubtCard = (d: any) => (
    <Card key={d.id} className="border-0 shadow-md bg-white hover:shadow-lg transition-all border-l-4 border-l-blue-500">
      <CardHeader className="pb-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg text-slate-900">{d.title}</CardTitle>
          <Badge variant="outline" className={getStatusBadgeClass(d.status)}>{d.status || 'UNKNOWN'}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Student:</span> {d.studentName || 'N/A'}
          <span className="mx-2">•</span>
          <span className="font-semibold">Course:</span> {d.courseTitle || 'N/A'}
        </div>
        <div className="text-sm text-slate-600 bg-slate-50 rounded-md p-3 border border-slate-200">{d.description}</div>

        {d.adminReply ? (
          <div className="text-sm bg-emerald-50 p-3 rounded-md border border-emerald-200 text-emerald-900">
            <span className="font-semibold">Admin Reply:</span> {d.adminReply}
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Type your reply"
              value={replyMap[d.id] || ''}
              onChange={(e) => setReplyMap((m) => ({ ...m, [d.id]: e.target.value }))}
            />
            <Button
              onClick={() => reply(d.id)}
              disabled={replyingId === d.id || !(replyMap[d.id] || '').trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {replyingId === d.id ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><MessageSquareReply className="h-4 w-4 mr-2" />Reply</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Doubts & Queries</h1>
        <p className="text-slate-600 text-lg">Review and resolve student doubts</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 shadow-sm">{error}</div>
      )}

      {success && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm">✓ {success}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Active Doubts</div>
            <div className="text-3xl font-bold text-amber-700">{activeDoubts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide">History</div>
            <div className="text-3xl font-bold text-emerald-700">{historyDoubts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-white border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
            <div className="text-3xl font-bold text-indigo-700">{doubts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="active" className="gap-2">
            <AlertCircle className="h-4 w-4" /> Active ({activeDoubts.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> History ({historyDoubts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-0">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading active doubts...</div>
          ) : activeDoubts.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-white">
              <CardContent className="p-10 text-center text-slate-600">No active doubts right now.</CardContent>
            </Card>
          ) : (
            activeDoubts.map(renderDoubtCard)
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-0">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading doubt history...</div>
          ) : historyDoubts.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-white">
              <CardContent className="p-10 text-center text-slate-600">No resolved/closed doubts yet.</CardContent>
            </Card>
          ) : (
            historyDoubts.map(renderDoubtCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
