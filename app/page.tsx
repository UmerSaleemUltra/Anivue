"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Search, Star, Play, ExternalLink, Calendar, Tv, Users, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Anime {
  mal_id: number
  title: string
  title_english?: string
  images: {
    jpg: {
      large_image_url: string
    }
  }
  score: number | null
  trailer: {
    youtube_id: string | null
    url: string | null
  } | null
  synopsis?: string
  episodes?: number
  status?: string
  aired?: {
    string: string
  }
  genres?: Array<{ name: string }>
  studios?: Array<{ name: string }>
  year?: number
  rating?: string
  duration?: string
}

interface ApiResponse {
  data: Anime[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

export default function AnimeSearchApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [animeResults, setAnimeResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [showingDefault, setShowingDefault] = useState(true)

  useEffect(() => {
    fetchDefaultAnime()
  }, [])

  const fetchDefaultAnime = async () => {
    setLoading(true)
    try {
      const response = await axios.get<ApiResponse>("https://api.jikan.moe/v4/top/anime?limit=20")
      setAnimeResults(response.data.data)
      setTotalPages(response.data.pagination.last_visible_page)
      setTotalResults(response.data.pagination.items.total)
      setCurrentPage(1)
      setShowingDefault(true)
    } catch (err) {
      setError("Failed to load featured anime.")
    } finally {
      setLoading(false)
    }
  }

  const searchAnime = async (page = 1) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError("")
    setHasSearched(true)
    setShowingDefault(false) // Add this line

    try {
      const response = await axios.get<ApiResponse>(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=20`,
      )
      setAnimeResults(response.data.data)
      setTotalPages(response.data.pagination.last_visible_page)
      setTotalResults(response.data.pagination.items.total)
      setCurrentPage(page)
    } catch (err) {
      setError("Failed to fetch anime data. Please try again.")
      setAnimeResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    searchAnime(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setCurrentPage(1)
      searchAnime(1)
    }
  }

  const handlePageChange = (page: number) => {
    searchAnime(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openModal = (anime: Anime) => {
    setSelectedAnime(anime)
  }

  const closeModal = () => {
    setSelectedAnime(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-pink-500 bg-clip-text text-transparent mb-4">
            ANIME NEXUS
          </h1>
          <p className="text-gray-400 text-lg">Discover legendary anime in the digital realm</p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search the anime multiverse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-14 text-lg bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="h-14 px-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-500/25"
            >
              {loading ? "SCANNING..." : "SEARCH"}
            </Button>
          </form>
        </div>

        {/* Clear Search Button */}
        {hasSearched && !showingDefault && (
          <div className="text-center mb-8">
            <Button
              onClick={() => {
                setSearchQuery("")
                setHasSearched(false)
                setShowingDefault(true)
                fetchDefaultAnime()
              }}
              variant="outline"
              className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-red-500/20 hover:border-red-500 hover:text-white"
            >
              ← Back to Trending
            </Button>
          </div>
        )}

        {/* Results Info */}
        {animeResults.length > 0 && !loading && (
          <div className="text-center mb-8">
            {showingDefault ? (
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  🔥 TRENDING ANIME
                </h2>
                <p className="text-gray-400">
                  Discover the most popular anime • <span className="text-red-400 font-semibold">{totalResults}</span>{" "}
                  total
                </p>
              </div>
            ) : (
              <p className="text-gray-400">
                Found <span className="text-red-400 font-semibold">{totalResults}</span> anime • Page {currentPage} of{" "}
                {totalPages}
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-6 text-gray-400 text-lg">Scanning the anime database...</p>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !loading && animeResults.length === 0 && !error && !showingDefault && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No anime found in the nexus for "{searchQuery}"</p>
            <p className="text-gray-500 mt-2">Try expanding your search parameters</p>
          </div>
        )}

        {/* Results Grid */}
        {animeResults.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {animeResults.map((anime) => (
                <Card
                  key={anime.mal_id}
                  className="group overflow-hidden bg-gray-800/30 border-gray-700/50 hover:border-red-500/50 transition-all duration-300 cursor-pointer backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/10 hover:scale-105"
                  onClick={() => openModal(anime)}
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={anime.images.jpg.large_image_url || "/placeholder.svg"}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
                    <h3 className="font-bold text-white mb-3 line-clamp-2 min-h-[3rem] group-hover:text-red-400 transition-colors">
                      {anime.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-yellow-400">
                          {anime.score ? anime.score.toFixed(1) : "N/A"}
                        </span>
                      </div>

                      {anime.trailer?.youtube_id && (
                        <div className="flex items-center gap-1 text-red-400">
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">TRAILER</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-red-500/20 hover:border-red-500 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  PREV
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-red-600 to-red-500 text-white"
                            : "bg-gray-800/50 border-gray-600 text-white hover:bg-red-500/20 hover:border-red-500"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-red-500/20 hover:border-red-500 disabled:opacity-30"
                >
                  NEXT
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Anime Details Modal */}
        <Dialog open={!!selectedAnime} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
            {selectedAnime && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    {selectedAnime.title}
                  </DialogTitle>
                  {selectedAnime.title_english && selectedAnime.title_english !== selectedAnime.title && (
                    <p className="text-gray-400 text-lg">{selectedAnime.title_english}</p>
                  )}
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                      <img
                        src={selectedAnime.images.jpg.large_image_url || "/placeholder.svg"}
                        alt={selectedAnime.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-gray-400">Score</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">
                          {selectedAnime.score ? selectedAnime.score.toFixed(1) : "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Tv className="w-5 h-5 text-red-400" />
                          <span className="text-gray-400">Episodes</span>
                        </div>
                        <p className="text-2xl font-bold text-red-400">{selectedAnime.episodes || "N/A"}</p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-4">
                      {selectedAnime.status && (
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2">Status</h4>
                          <Badge variant="outline" className="border-red-500/30 text-red-400">
                            {selectedAnime.status}
                          </Badge>
                        </div>
                      )}

                      {selectedAnime.aired?.string && (
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Aired
                          </h4>
                          <p className="text-gray-300">{selectedAnime.aired.string}</p>
                        </div>
                      )}

                      {selectedAnime.studios && selectedAnime.studios.length > 0 && (
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Studios
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnime.studios.map((studio, index) => (
                              <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                                {studio.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAnime.genres && selectedAnime.genres.length > 0 && (
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Genres
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnime.genres.map((genre, index) => (
                              <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/30">
                                {genre.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Trailer */}
                    {selectedAnime.trailer?.youtube_id && (
                      <div>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold"
                        >
                          <a
                            href={`https://www.youtube.com/watch?v=${selectedAnime.trailer.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Play className="w-5 h-5 fill-current" />
                            WATCH TRAILER
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* Synopsis */}
                    {selectedAnime.synopsis && (
                      <div>
                        <h4 className="text-red-400 font-semibold mb-3">Synopsis</h4>
                        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                          <p className="text-gray-300 leading-relaxed">{selectedAnime.synopsis}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <a
              href="https://jikan.moe/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Jikan API
            </a>{" "}
            •{" "}
            <a
              href="https://myanimelist.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              MyAnimeList
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
