"use client";

import {

Circle

} from "lucide-react";

export default function SystemStatus(){

return(

<div
className="
bg-white
dark:bg-slate-900
rounded-2xl
border
p-6
"
>

<h2
className="
font-bold
text-lg
mb-5
"
>

Status Sistem

</h2>

<div className="space-y-5">

<div className="flex justify-between">

<span>

Backend API

</span>

<div className="flex items-center gap-2">

<Circle
size={10}
fill="green"
color="green"
/>

Online

</div>

</div>

<div className="flex justify-between">

<span>

Database

</span>

<div className="flex items-center gap-2">

<Circle
size={10}
fill="green"
color="green"
/>

Connected

</div>

</div>

<div className="flex justify-between">

<span>

Monitoring Engine

</span>

<div className="flex items-center gap-2">

<Circle
size={10}
fill="green"
color="green"
/>

Running

</div>

</div>

</div>

</div>

)

}