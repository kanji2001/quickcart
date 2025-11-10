import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Activity, BellRing, Package } from 'lucide-react';

const trackingPreview = [
  { status: 'Order placed', detail: 'We received your order and started preparing it.' },
  { status: 'Packed & ready', detail: 'Your items are packed and awaiting courier pickup.' },
  { status: 'On the way', detail: 'Real-time tracking with map view arrives soon.' },
];

export default function TrackOrder() {
  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1">
            Real-time tracking coming soon
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Track your order</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re finalizing a live tracking dashboard with courier updates, map view, and delivery notifications. Meanwhile, our team
            can give you the latest status manually.
          </p>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <Card className="border border-muted/60">
              <CardHeader>
                <CardTitle>What to expect</CardTitle>
                <CardDescription>Your upcoming tracking experience at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {trackingPreview.map((item, index) => (
                  <div key={item.status} className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-muted-foreground leading-6">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-6"
          >
            <Card className="border-none bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
              <CardContent className="space-y-6 p-8">
                <Package className="h-10 w-10" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">Need instant updates?</h3>
                  <p className="text-sm text-white/80 leading-6">
                    Share your order ID with support and we&apos;ll send the latest courier status, including estimated delivery dates.
                  </p>
                </div>
                <Button asChild size="lg" variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                  <Link to="/contact">Talk to support</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-muted/60">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Heads-up notifications</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-6">
                  Enable notifications in your QuickCart profile to get alerts when your package ships, is out for delivery, or arrives.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">Manage notifications</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-muted/60">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Delivery promise</h4>
                </div>
                <CardDescription className="text-sm leading-6">
                  If your order is late, let us know. We&apos;ll investigate with the courier and make it right with express reshipment or a
                  refund.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}


