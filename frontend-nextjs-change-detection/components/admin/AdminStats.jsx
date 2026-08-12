"use client";

import {

    Users,
    Globe,
    Activity,

} from "lucide-react";

export default function AdminStats({

    dashboard

}) {

    const cards = [

        {

            title: "Users",

            value: dashboard.total_users,

            icon: Users,

            color: "bg-blue-500"

        },

        {

            title: "Websites",

            value: dashboard.total_sites,

            icon: Globe,

            color: "bg-violet-500"

        },

        {

            title: "Active",

            value: dashboard.active_sites,

            icon: Activity,

            color: "bg-green-500"

        }

    ];

    return (

        <div className="grid lg:grid-cols-3 gap-6">

            {

                cards.map((card, index) => {

                    const Icon = card.icon;

                    return (

                        <div
                            key={index}
                            className="
bg-white
dark:bg-slate-900
rounded-2xl
shadow-sm
p-6
border
">

                            <div className="flex justify-between">

                                <div>

                                    <p className="text-slate-500">

                                        {card.title}

                                    </p>

                                    <h2 className="text-4xl font-bold mt-3">

                                        {card.value}

                                    </h2>

                                </div>

                                <div
                                    className={`
${card.color}
h-14
w-14
rounded-xl
text-white
flex
items-center
justify-center
`}
                                >

                                    <Icon />

                                </div>

                            </div>

                        </div>

                    )

                })

            }

        </div>

    )

}