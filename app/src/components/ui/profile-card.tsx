import { motion } from "framer-motion"
import { Clock, Edit, User, Ruler, Weight, Activity, Target, Zap } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface ProfileCardProps {
    clientName: string;
    email: string;
    memberSince?: string;
    age: string;
    height: string;
    weight: string;
    activityLevel: string;
    goal: string;
    dailyCalories: string;
    avatarSrc: string;
    onUpdateProfile?: () => void;
}

const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | number; icon?: any }) => (
    <div className="bg-background/50 border border-border/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:bg-background transition-colors group">
        {Icon && <Icon className="w-4 h-4 text-primary/60 mb-2 group-hover:text-primary transition-colors" />}
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</span>
        <span className="font-extrabold text-sm text-card-foreground capitalize">{value}</span>
    </div>
);

export const ProfileCard = ({
    clientName,
    email,
    memberSince,
    age,
    height,
    weight,
    activityLevel,
    goal,
    dailyCalories,
    avatarSrc,
    onUpdateProfile,
}: ProfileCardProps) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card className="w-full h-full flex flex-col rounded-[2rem] shadow-sm border border-border/50 overflow-hidden">
                <CardHeader className="p-6 bg-gradient-to-b from-primary/10 to-transparent">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                <AvatarImage src={avatarSrc} alt={clientName} className="object-cover" />
                                <AvatarFallback>{clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <p className="font-bold text-xl text-foreground capitalize">
                                    {clientName}
                                </p>
                                <span className="text-sm font-medium text-muted-foreground">{email}</span>
                                {memberSince && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground/70 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Member since {memberSince}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
                            Premium
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 flex-1 bg-secondary/5 mb-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <InfoItem label="Age" value={`${age} yrs`} icon={User} />
                        <InfoItem label="Height" value={`${height} cm`} icon={Ruler} />
                        <InfoItem label="Weight" value={`${weight} kg`} icon={Weight} />
                        <InfoItem label="Activity" value={activityLevel} icon={Activity} />
                        <InfoItem label="Goal" value={goal.replace('_', ' ')} icon={Target} />
                        <InfoItem label="Budget" value={`${dailyCalories} cal`} icon={Zap} />
                    </div>
                </CardContent>

                <CardFooter className="p-6 bg-card border-t border-border/50">
                    <Button className="w-full font-bold shadow-md shadow-primary/20 rounded-xl" onClick={onUpdateProfile}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Profile Details
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};
