const stats = [
  { id: 1, name: "Workers", value: "700" },
  { id: 2, name: "Employees", value: "650" },
  { id: 3, name: "Supervisors", value: "50" },
];

export default function Stats() {
  return (
    <div className="bg-white py-4 sm:py-6">
      <div className="mx-auto max-w-lg px-2 lg:px-4">
        <dl className="grid grid-cols-1 gap-x-2 gap-y-4 text-center lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="mx-auto flex max-w-xs flex-col gap-y-1"
            >
              <dt className="text-sm leading-6 text-gray-600">{stat.name}</dt>
              <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
