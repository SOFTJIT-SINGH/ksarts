"use client";

import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetrainButton() {
  return (
    <Button
      className="text-xs h-10 gap-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
      onClick={() => alert("Model retraining runs server-side via the Flask ML service.\n\nTo retrain:\n1. cd flask_service\n2. python train_models.py\n3. Restart Flask: python app.py\n\nNew predictions will appear automatically.")}
    >
      <Zap className="h-4 w-4" />
      <span>Re-run AI Model Training</span>
    </Button>
  );
}
