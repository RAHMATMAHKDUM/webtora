"use client";

import {

ResponsiveContainer,
AreaChart,
Area,
CartesianGrid,
XAxis,
YAxis,
Tooltip

} from "recharts";

export default function MonitoringChart({

dashboard

}){

const data=[

{
day:"Mon",
value:18
},

{
day:"Tue",
value:23
},

{
day:"Wed",
value:28
},

{
day:"Thu",
value:31
},

{
day:"Fri",
value:27
},

{
day:"Sat",
value:35
},

{
day:"Sun",
value:42
}

];

return(

<div
className="
bg-white
dark:bg-slate-900
rounded-2xl
border
p-6
shadow-sm
"
>

<div className="mb-5">

<h2
className="font-bold text-lg"
>

Monitoring Activity

</h2>

<p
className="text-sm text-slate-500"
>

Aktivitas monitoring 7 hari terakhir

</p>

</div>

<div style={{height:320}}>

<ResponsiveContainer>

<AreaChart
data={data}
>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis
dataKey="day"
/>

<YAxis/>

<Tooltip/>

<Area

type="monotone"

dataKey="value"

stroke="#6366F1"

fill="#C7D2FE"

/>

</AreaChart>

</ResponsiveContainer>

</div>

</div>

)

}