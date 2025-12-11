import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function RateUsDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Thank You!", description: "Your feedback has been submitted" });
    setOpen(false);
    setRating(0);
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Star className="w-4 h-4 mr-2" />Rate Us</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Rate WealthWise
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">How would you rate your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-emerald-600 font-medium">
                {rating === 5 ? "Amazing! 🎉" : rating >= 4 ? "Great! 😊" : rating >= 3 ? "Good 👍" : rating >= 2 ? "Fair 🤔" : "We'll do better 💪"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Share your feedback (Optional)</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you love or what we can improve..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Maybe Later</Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={rating === 0}>Submit Review</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}