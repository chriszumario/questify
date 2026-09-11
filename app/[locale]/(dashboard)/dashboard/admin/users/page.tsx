import { getUsersList } from "@/features/admin/server/actions";
import { UsersDataTable } from "@/features/admin/components/users-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function AdminUsersPage() {
  const t = await getTranslations('AdminUsers');
  const users = await getUsersList();

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('desc')}
        </p>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
          <CardTitle>{t('allUsers')}</CardTitle>
          <CardDescription>
            {t('totalUsers', { count: users.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <UsersDataTable data={users} />
        </CardContent>
      </Card>
    </div>
  );
}
