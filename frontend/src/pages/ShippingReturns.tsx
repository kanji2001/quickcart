import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PackageSearch, RefreshCcw, CalendarClock } from 'lucide-react';

const upcomingFeatures = [
  {
    title: 'Live delivery timeline',
    description: 'Track parcels on a map with proactive carrier updates.',
    icon: PackageSearch,
  },
  {
    title: 'Instant return labels',
    description: 'Generate QR codes or print-ready labels anytime in a few taps.',
    icon: RefreshCcw,
  },
  {
    title: 'Smart scheduling',
    description: 'Pick delivery windows that work for you with flexible rescheduling.',
    icon: CalendarClock,
  },
];

export default function ShippingReturns() {
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
            Enhanced shipping experience coming soon
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Shipping & Returns</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re polishing a brand-new delivery and returns hub. While it&apos;s in the works, our support team can help with any
            existing order.
          </p>
        </motion.section>

        <div className="grid gap-6 md:grid-cols-3">
          {upcomingFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="h-full border border-muted/60">
                <CardContent className="space-y-4 p-6">
                  <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-6">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto border border-dashed border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Need assistance right now?</CardTitle>
            <CardDescription>
              Our specialists can help with delivery updates, returns, and courier claims while we finish the new hub.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/contact">Contact support</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/faq">Read FAQs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


