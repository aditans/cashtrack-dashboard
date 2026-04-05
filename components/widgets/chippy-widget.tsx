import { IconBolt, IconMoodSmile, IconPigMoney } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const prompts = [
  "Where did my last 7 days spend spike happen?",
  "Give me a roast for impulsive shopping this month.",
  "How much should I save weekly to hit ₹50k this quarter?",
]

export function ChippyWidget() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Chippy</CardTitle>
          <CardDescription>Old assistant section brought to a cleaner shadcn page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          <div className="rounded-none border bg-muted/50 p-4 text-sm text-muted-foreground">
            Chippy uses your historical transaction trends to generate insights, nudges, and playful spending feedback.
          </div>

          <Textarea placeholder="Ask Chippy about your spending behavior..." defaultValue="Show my top recurring charges and suggest one to cut." />
          <div className="flex flex-wrap gap-2">
            <Button><IconBolt className="size-4" /> Generate insight</Button>
            <Button variant="outline"><IconMoodSmile className="size-4" /> Weekly roast</Button>
            <Button variant="outline"><IconPigMoney className="size-4" /> Savings plan</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Quick prompts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 pt-4">
          {prompts.map((prompt) => (
            <Badge key={prompt} variant="outline" className="h-auto justify-start px-3 py-2 text-left text-xs whitespace-normal">
              {prompt}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}