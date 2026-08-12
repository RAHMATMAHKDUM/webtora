"use client";

export default function LatestUsers({

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

Latest Users

</h2>

<div className="space-y-4">

{

dashboard.latest_users.map(user=>(

<div
key={user.id}
className="
flex
justify-between
items-center
"
>

<div>

<div
className="font-semibold"
>

{user.username}

</div>

<div
className="text-xs text-slate-500"
>

{user.email || "No Email"}

</div>

</div>

<div
className="
text-xs
text-slate-400
"
>

ID #{user.id}

</div>

</div>

))

}

</div>

</div>

)

}