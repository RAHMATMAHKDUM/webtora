"use client";

export default function LatestSites({

dashboard

}){

return(

<div
className="
bg-white
dark:bg-slate-900
rounded-2xl
border
shadow-sm
p-6
"
>

<h2
className="font-bold mb-5"
>

Latest Monitoring

</h2>

<div className="space-y-4">

{

dashboard.latest_sites.map(site=>(

<div
key={site.id}
className="
border-b
pb-3
last:border-0
"
>

<div
className="font-medium"
>

{site.url}

</div>

<div
className="
text-xs
text-slate-500
mt-1
"
>

Owner :

{site.user}

</div>

<div
className="
mt-2
inline-flex
px-3
py-1
rounded-full
text-xs
bg-green-100
text-green-700
"
>

{

site.active

?

"Running"

:

"Stopped"

}

</div>

</div>

))

}

</div>

</div>

)

}