export class Pageable {
    items: any[]
    totalCount: number
    currentPage: number
    totalPages: number

    constructor(items: any[], totalCount: number, currentPage: number, itemsPerPage: number) {
        this.items = items
        this.totalCount = totalCount
        this.currentPage = currentPage
        this.totalPages = Math.ceil(totalCount / itemsPerPage)
    }
}
