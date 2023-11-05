export class ItemUtils {
  public static decodeIcon(icon: string, offset = 1): string | null | undefined {
    if (!icon) {
      return null
    }

    const split = icon.split('/')
    const base64String = split[5]
    const iconInfo = JSON.parse(Buffer.from(base64String, 'base64').toString('ascii'))?.[2]
    const categoryString = iconInfo['f']?.split('/')

    return categoryString?.[(categoryString?.length ?? 0) - offset - 1]?.toLowerCase()
  }
}
