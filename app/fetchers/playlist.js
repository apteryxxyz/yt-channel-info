const helper = require('../helper')

class PlaylistFetcher {
  constructor(url) {
    const _url = url
    this.getOriginalURL = () => _url
  }

  static async getChannelPlaylistLast (channelId) {
    const channelUrl = `https://youtube.com/channel/${channelId}/playlists?flow=grid&view=1&pbj=1`
    const channelPageResponse = await helper.makeChannelRequest(channelUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    return await this.parseChannelPlaylistResponse(channelPageResponse, channelId)
  }

  static async getChannelPlaylistOldest (channelId) {
    const channelUrl = `https://youtube.com/channel/${channelId}/playlists?view=1&sort=da&flow=grid&pbj=1`
    const channelPageResponse = await helper.makeChannelRequest(channelUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    return await this.parseChannelPlaylistResponse(channelPageResponse, channelId)
  }

  static async getChannelPlaylistNewest (channelId) {
    const channelUrl = `https://youtube.com/channel/${channelId}/playlists?view=1&sort=dd&flow=grid&pbj=1`
    const channelPageResponse = await helper.makeChannelRequest(channelUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    return await this.parseChannelPlaylistResponse(channelPageResponse, channelId)
  }

  static async parseChannelPlaylistResponse (response, channelId) {
    const channelMetaData = response.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://youtube.com/channel/${channelId}`
    }

    const playlistData = response.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs[2].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer

    const playlistItems = playlistData.items.filter((playlist) => {
      return typeof (playlist.gridShowRenderer) === 'undefined'
    }).map((playlist) => {
      return helper.parsePlaylist(playlist, channelInfo)
    })

    let continuation = null

    if (typeof (playlistData.continuations) !== 'undefined') {
      continuation = playlistData.continuations[0].nextContinuationData.continuation
    }

    return {
      continuation: continuation,
      items: playlistItems
    }
  }
}

module.exports = PlaylistFetcher
