import { getTrending, Subject } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/admin/Pagination';
import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoviesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;

    let movies: Subject[] = [];
    let hasMore = false;
    let errorMsg = '';

    try {
        const { subjectList, pager } = await getTrending(page);
        movies = subjectList;
        hasMore = pager.hasMore;
    } catch (e: any) {
        console.error("Error fetching movies:", e);
        errorMsg = e.message;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Data Film</h1>
            </div>

            <Card className="bg-[#141414] border-gray-800 text-white">
                <CardHeader>
                    <CardTitle>Movie List</CardTitle>
                </CardHeader>
                <CardContent>
                    {errorMsg ? (
                        <div className="p-4 text-red-500 bg-red-500/10 rounded border border-red-500/20">
                            Error: {errorMsg}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-800 hover:bg-transparent">
                                        <TableHead className="text-gray-400 w-[100px]">Poster</TableHead>
                                        <TableHead className="text-gray-400">Title</TableHead>
                                        <TableHead className="text-gray-400">ID</TableHead>
                                        <TableHead className="text-gray-400">Type</TableHead>
                                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movies.map((movie) => (
                                        <TableRow key={movie.subjectId} className="border-gray-800 hover:bg-gray-900/50">
                                            <TableCell>
                                                <div className="relative w-12 h-16 rounded overflow-hidden">
                                                    <Image
                                                        src={movie.cover?.url || '/placeholder.png'}
                                                        alt={movie.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{movie.title}</TableCell>
                                            <TableCell className="text-gray-500 text-sm font-mono">{movie.subjectId}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-gray-600 text-gray-300">
                                                    {movie.subjectType === 1 ? 'Movie' : 'Series'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/movies/${movie.subjectId}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {movies.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                No movies found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <Pagination currentPage={page} hasMore={hasMore} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
