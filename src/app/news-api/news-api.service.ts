import { Injectable } from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {tap, map, switchMap, pluck} from 'rxjs/operators';
import  {HttpParams, HttpClient} from '@angular/common/http';


interface NewsApiResponse {
  totalResults: number;
  articles: Article[];
}

export interface Article {
  title: string;
  url: string;
  source: {
    name: string;
  }
}


@Injectable({
  providedIn: 'root'
})
export class NewsApiService {

  private url = 'https://newsapi.org/v2/top-headlines';
  private pageSize = 10;
  private apiKey = 'ba89fcfe5f354c4bb85e7bd65873ede9';
  private country = 'gr';

  private pagesInput: Subject<number>;
  pagesOutput: Observable<Article[]>;
  numberOfPages: Subject<number>;

  constructor(private http: HttpClient) {
    this.numberOfPages = new Subject();

    this.pagesInput = new Subject();
    this.pagesOutput = this.pagesInput.pipe(
      map((page) => {
        return new HttpParams()
            .set('apikey', this.apiKey)
            .set('country', this.country)
            .set('pageSize', this.pageSize.toString())
            .set('page', page.toString());
      }),
      switchMap((params) => {
        return this.http.get<NewsApiResponse>(this.url, {params});
      }),
      tap(response => {
        const totalPages = Math.ceil(response.totalResults/this.pageSize);
        this.numberOfPages.next(totalPages);
      }),
      pluck('articles'),
    );
  }


getPage(page: number) {
  this.pagesInput.next(page);
}

}
