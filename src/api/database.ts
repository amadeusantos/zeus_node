import { EntitySchemaWithMeta, FilterQuery, InferEntity, RequestContext } from "@mikro-orm/core";

export async function pagination<T extends EntitySchemaWithMeta>(entity: T, page: number, size: number, ording?: string, filters?: FilterQuery<InferEntity<T>>) {
    const offset = (page - 1) * size;

    const orderBy: Record<string, 'asc' | 'desc'> = {};

    if (ording) {
        const order = ording.startsWith('-') ? 'desc' : 'asc';
        const field = ording.startsWith('-') ? ording.slice(1) : ording;
        orderBy[field] = order;
    }


    const [result, total_items] = await RequestContext.getEntityManager()!.findAndCount(entity, filters, {
        limit: size,
        offset: offset,
        orderBy: orderBy,
    });

    const total_pages = Math.ceil(total_items / size);

    return {
        page,
        size,
        total_items,
        total_pages,
        result,
    };
}