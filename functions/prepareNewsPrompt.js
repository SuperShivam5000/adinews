function prepareNewsPrompt(newsData) {
    if (!newsData || newsData.status !== "ok" || !newsData.articles || newsData.articles.length === 0) {
        return "No valid news articles found.";
    }
  
    return newsData.articles.map(article => {
        return `Source: ${article.source.name || "Unknown"}
  Author: ${article.author || "Unknown"}
  Title: ${article.title}
  Description: ${article.description}
  Content: ${article.content ? article.content.replace(/\[.*?\]/g, "").trim() : "No content available"}
  
  --- END OF ARTICLE ---
  `;
    }).join("\n");
  }
  
  module.exports = prepareNewsPrompt;