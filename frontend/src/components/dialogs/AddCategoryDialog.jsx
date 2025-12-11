import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const colorOptions = [
	{ value: "hsl(160, 84%, 39%)", label: "Emerald" },
	{ value: "hsl(45, 93%, 47%)", label: "Gold" },
	{ value: "hsl(200, 84%, 50%)", label: "Blue" },
	{ value: "hsl(280, 84%, 50%)", label: "Purple" },
	{ value: "hsl(340, 84%, 50%)", label: "Pink" },
	{ value: "hsl(30, 84%, 50%)", label: "Orange" },
	{ value: "hsl(120, 60%, 50%)", label: "Green" },
];

export function AddCategoryDialog({ trigger }) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		type: "expense",
		color: "hsl(160, 84%, 39%)",
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		toast({
			title: "Category Created",
			description: `"${formData.name}" category added`,
		});
		setOpen(false);
		setFormData({ name: "", type: "expense", color: "hsl(160, 84%, 39%)" });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="hero">
						<Tag className="w-4 h-4 mr-2" />
						Add Category
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Category</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Category Name</Label>
						<Input
							variant="emerald"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g., Groceries, Salary"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label>Type</Label>
						<Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="expense">Expense</SelectItem>
								<SelectItem value="income">Income</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Color</Label>
						<div className="flex gap-2 flex-wrap">
							{colorOptions.map((color) => (
								<button
									key={color.value}
									type="button"
									onClick={() => setFormData({ ...formData, color: color.value })}
									className={`w-8 h-8 rounded-full transition-all ${
										formData.color === color.value
											? "ring-2 ring-offset-2 ring-primary scale-110"
											: "hover:scale-105"
									}`}
									style={{ backgroundColor: color.value }}
									title={color.label}
								/>
							))}
						</div>
					</div>

					<div className="p-4 rounded-lg border bg-muted/50">
						<div className="flex items-center gap-3">
							<div
								className="w-10 h-10 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: `${formData.color}20` }}
							>
								<Tag className="w-5 h-5" style={{ color: formData.color }} />
							</div>
							<div>
								<p className="font-medium">{formData.name || "Category Name"}</p>
								<p className="text-sm text-muted-foreground">{formData.type}</p>
							</div>
						</div>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button type="submit" variant="hero" className="flex-1">
							Add Category
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}