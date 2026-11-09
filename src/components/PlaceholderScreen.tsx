import { EmptyState } from "@/ui";

type Props = {
  title: string;
  description: string;
};

/** For destinations that aren't built yet. */
export function PlaceholderScreen({ title, description }: Props) {
  return <EmptyState icon="construct-outline" title={title} message={description} />;
}
