import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, LineChart, Target, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const cookieTypes = [
  {
    title: 'Essential cookies',
    description: 'Power secure login, keep items in your cart, and maintain checkout sessions.',
    icon: Shield,
  },
  {
    title: 'Analytics cookies',
    description: 'Help us understand site performance so we can improve navigation and product discovery.',
    icon: LineChart,
  },
  {
    title: 'Marketing cookies',
    description: 'Enable personalized offers and measure the impact of promotions you see from QuickCart.',
    icon: Target,
  },
];

export default function Cookies() {
  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1 gap-2">
            <Cookie className="h-4 w-4 text-primary" />
            Cookie preferences
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
          <p className="text-muted-foreground text-lg">
            Cookies help us make QuickCart faster, safer, and more relevant. Here&apos;s how we use them and the control you have.
          </p>
        </motion.section>

        <div className="grid gap-6 md:grid-cols-3">
          {cookieTypes.map((cookie, index) => (
            <motion.div
              key={cookie.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="h-full border border-muted/60">
                <CardContent className="space-y-4 p-6">
                  <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
                    <cookie.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{cookie.title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">{cookie.description}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto border border-muted/60">
          <CardHeader>
            <CardTitle>Managing cookies</CardTitle>
            <CardDescription>
              Most browsers let you control cookies through settings. Disabling essential cookies may impact your ability to sign in or
              check out on QuickCart.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/privacy">Read our privacy policy</Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.allaboutcookies.org/manage-cookies"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                Learn browser controls
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

