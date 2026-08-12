"use client";

import {

Globe,

Users,

Bell,

Settings

} from "lucide-react";

import Link from "next/link";

const actions=[

{

title:"Tambah Monitoring",

href:"/admin/monitoring",

icon:Globe,

color:"bg-indigo-500"

},

{

title:"Kelola User",

href:"/admin/users",

icon:Users,

color:"bg-green-500"

},

{

title:"Notification",

href:"/admin/notifications",

icon:Bell,

color:"bg-orange-500"

},

{

title:"Setting",

href:"/admin/settings",

icon:Settings,

color:"bg-purple-500"

}

];

export default function QuickActions(){

return(

<div className="grid md:grid-cols-4 gap-5">

{

actions.map((item,index)=>{

const Icon=item.icon;

return(

<Link

href={item.href}

key={index}

className="
rounded-2xl
bg-white
dark:bg-slate-900
border
shadow-sm
p-5
hover:shadow-xl
duration-300
"

>

<div

className={`
${item.color}
w-14
h-14
rounded-xl
flex
items-center
justify-center
text-white
mb-4
`}

>

<Icon/>

</div>

<h2
className="font-semibold"
>

{item.title}

</h2>

</Link>

)

})

}

</div>

)

}