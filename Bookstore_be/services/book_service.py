from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from typing import Optional, Dict, Any, List

def get_books_with_filter(
    db: Session,
    filter_by: str,
    author_id: Optional[int] = None,
    category_id: Optional[int] = None,
    star: Optional[float] = None,
    limit: Optional[int] = None,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Get books with filtering and sorting options
    """
    try:
        # Convert star to float if it's not None
        star_value = float(star) if star is not None else 0
        
        if filter_by == 'discount_desc':
            sql_query = text("""
                SELECT 
                    b.id,
                    b.book_title,
                    b.book_summary,
                    b.book_price,
                    b.book_cover_photo,
                    b.category_id,
                    b.author_id,
                    a.author_name,
                    COALESCE(AVG(r.rating_star::FLOAT), 0) AS avg_rating,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'discount_price', d.discount_price,
                                'discount_end_date', d.discount_end_date
                            )
                        ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                        '[]'::json
                    ) as discounts,
                    json_build_object(
                        'id', a.id,
                        'author_name', a.author_name
                    ) as author,
                    CASE 
                        WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                        THEN MIN(d.discount_price) 
                        ELSE b.book_price 
                    END as final_price,
                    CASE 
                        WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                        THEN b.book_price - MIN(d.discount_price)
                        ELSE 0 
                    END as discount_amount,
                    CASE
                        WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                        THEN 1
                        ELSE 0
                    END as has_discount
                FROM book b
                LEFT JOIN discount d ON b.id = d.book_id
                LEFT JOIN review r ON b.id = r.book_id
                JOIN author a ON b.author_id = a.id
                WHERE (:author_id IS NULL OR b.author_id = :author_id)
                  AND (:category_id IS NULL OR b.category_id = :category_id)
                GROUP BY 
                    b.id, 
                    b.book_title,
                    b.book_summary,
                    b.book_price,
                    b.book_cover_photo,
                    b.category_id,
                    b.author_id,
                    a.id,
                    a.author_name
                HAVING COALESCE(AVG(r.rating_star::FLOAT), 0) >= :star_value
                ORDER BY 
                    has_discount DESC,
                    discount_amount DESC,
                    final_price ASC
                OFFSET :offset
                LIMIT :limit;
            """)
        elif filter_by == 'popular_desc':
            sql_query = text("""
                SELECT
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.author_name,
                COALESCE(AVG(r.rating_star::FLOAT), 0) AS avg_rating,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'discount_price', d.discount_price,
                            'discount_end_date', d.discount_end_date
                        )
                    ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                    '[]'::json
                ) as discounts,
                json_build_object(
                    'id', a.id,
                    'author_name', a.author_name
                ) as author,
                COUNT(r.id) as review_count,
                CASE 
                    WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                    THEN MIN(d.discount_price) 
                    ELSE b.book_price 
                END as final_price
            FROM book b
            LEFT JOIN review r ON b.id = r.book_id
            LEFT JOIN discount d ON b.id = d.book_id
            JOIN author a ON b.author_id = a.id
            WHERE (:author_id IS NULL OR b.author_id = :author_id)
              AND (:category_id IS NULL OR b.category_id = :category_id)
            GROUP BY
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.id,
                a.author_name
            HAVING COALESCE(AVG(r.rating_star::FLOAT), 0) >= :star_value
            ORDER BY
                COUNT(r.id) DESC,
                final_price ASC
            OFFSET :offset
            LIMIT :limit
            ;""")
        elif filter_by == 'final_price_asc':
            sql_query = text("""
            SELECT 
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.author_name,
                COALESCE(AVG(r.rating_star::FLOAT), 0) AS avg_rating,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'discount_price', d.discount_price,
                            'discount_end_date', d.discount_end_date
                        )
                    ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                    '[]'::json
                ) as discounts,
                json_build_object(
                    'id', a.id,
                    'author_name', a.author_name
                ) as author,
                CASE 
                    WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                    THEN MIN(d.discount_price) 
                    ELSE b.book_price 
                END as final_price
            FROM book b
            LEFT JOIN discount d ON b.id = d.book_id
            LEFT JOIN review r ON b.id = r.book_id
            JOIN author a ON b.author_id = a.id
            WHERE (:author_id IS NULL OR b.author_id = :author_id)
              AND (:category_id IS NULL OR b.category_id = :category_id)
            GROUP BY 
                b.id, 
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.id,
                a.author_name
            HAVING COALESCE(AVG(r.rating_star::FLOAT), 0) >= :star_value
            ORDER BY 
                final_price ASC
            OFFSET :offset
            LIMIT :limit
            ;""")
        elif filter_by == 'final_price_desc':
            sql_query = text("""
            SELECT 
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.author_name,
                COALESCE(AVG(r.rating_star::FLOAT), 0) AS avg_rating,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'discount_price', d.discount_price,
                            'discount_end_date', d.discount_end_date
                        )
                    ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                    '[]'::json
                ) as discounts,
                json_build_object(
                    'id', a.id,
                    'author_name', a.author_name
                ) as author,
                CASE 
                    WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                    THEN MIN(d.discount_price) 
                    ELSE b.book_price 
                END as final_price
            FROM book b
            LEFT JOIN discount d ON b.id = d.book_id
            LEFT JOIN review r ON b.id = r.book_id
            JOIN author a ON b.author_id = a.id
            WHERE (:author_id IS NULL OR b.author_id = :author_id)
              AND (:category_id IS NULL OR b.category_id = :category_id)
            GROUP BY 
                b.id, 
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.id,
                a.author_name
            HAVING COALESCE(AVG(r.rating_star::FLOAT), 0) >= :star_value
            ORDER BY 
                final_price DESC
            OFFSET :offset
            LIMIT :limit
            ;""")
        else:
            raise HTTPException(status_code=400, detail="Invalid sort parameter")
        
        result = db.execute(sql_query, {
            "author_id": author_id,
            "category_id": category_id,
            "star_value": star_value,
            "offset": offset, 
            "limit": limit if limit else 100
        })
        books = result.fetchall()
        
        # Convert to list of dictionaries for response
        return [dict(row._mapping) for row in books]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_recommended_books(db: Session) -> List[Dict[str, Any]]:
    """
    Get recommended books (highest rated)
    """
    try:
        sql_query = text("""
        SELECT 
            b.id,
            b.book_title,
            b.book_summary,
            b.book_price,
            b.book_cover_photo,
            b.category_id,
            b.author_id,
            a.author_name,
            COALESCE(AVG(r.rating_star::FLOAT), 0) AS avg_rating,
            CASE 
                WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                THEN MIN(d.discount_price) 
                ELSE b.book_price 
            END as final_price,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'discount_price', d.discount_price,
                        'discount_end_date', d.discount_end_date
                    )
                ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)), 
                '[]'
            ) AS discounts,
            json_build_object(
                'id', a.id,
                'author_name', a.author_name
            ) AS author
        FROM book b
        LEFT JOIN review r ON b.id = r.book_id
        LEFT JOIN discount d ON b.id = d.book_id
        JOIN author a ON b.author_id = a.id
        GROUP BY 
            b.id, 
            b.book_title,
            b.book_summary,
            b.book_price,
            b.book_cover_photo,
            b.category_id,
            b.author_id,
            a.id,
            a.author_name
        ORDER BY avg_rating DESC, final_price ASC
        LIMIT 8;
        """)
        result = db.execute(sql_query)
        books = result.fetchall()
        return [dict(row._mapping) for row in books]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_popular_books(db: Session) -> List[Dict[str, Any]]:
    """
    Get popular books (most reviewed)
    """
    try:
        sql_query = text("""
        SELECT  
        b.id,
        b.book_title,
        b.book_summary,
        b.book_price,
        b.book_cover_photo,
        b.category_id,
        b.author_id,
        a.author_name,
        COUNT(r.id) AS review_count,
        COALESCE(AVG(r.rating_star::FLOAT), 0) AS avg_rating,
        CASE 
            WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
            THEN MIN(d.discount_price) 
            ELSE b.book_price 
        END as final_price,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'discount_price', d.discount_price,
                    'discount_end_date', d.discount_end_date
                )
            ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)), 
            '[]'
        ) AS discounts,
        json_build_object(
            'id', a.id,
            'author_name', a.author_name
        ) AS author
        FROM book b
        LEFT JOIN review r ON b.id = r.book_id
        LEFT JOIN discount d ON b.id = d.book_id
        JOIN author a ON b.author_id = a.id
        GROUP BY 
            b.id, 
            b.book_title,
            b.book_summary,
            b.book_price,
            b.book_cover_photo,
            b.category_id,
            b.author_id,
            a.id,
            a.author_name
        ORDER BY review_count DESC, final_price ASC
        LIMIT 8;
        """)
        result = db.execute(sql_query)
        books = result.fetchall()
        return [dict(row._mapping) for row in books]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_books_by_category(db: Session, category_id: int) -> List[Dict[str, Any]]:
    """
    Get books by category
    """
    try:
        sql_query = text("""
            SELECT 
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.author_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'discount_price', d.discount_price,
                            'discount_end_date', d.discount_end_date
                        )
                    ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                    '[]'::json
                ) as discounts,
                json_build_object(
                    'id', a.id,
                    'author_name', a.author_name
                ) as author,
                CASE 
                    WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                    THEN MIN(d.discount_price) 
                    ELSE b.book_price 
                END as final_price
            FROM book b
            LEFT JOIN discount d ON b.id = d.book_id
            JOIN author a ON b.author_id = a.id
            WHERE b.category_id = :category_id
            GROUP BY 
                b.id, 
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.id,
                a.author_name
        """)
        result = db.execute(sql_query, {"category_id": category_id})
        books = result.fetchall()
        return [dict(row._mapping) for row in books]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_onsale_books(db: Session) -> List[Dict[str, Any]]:
    """
    Get books that are on sale (have active discounts)
    """
    try:
        sql_query = text("""
            SELECT 
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.author_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'discount_price', d.discount_price,
                            'discount_end_date', d.discount_end_date
                        )
                    ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                    '[]'::json
                ) as discounts,
                json_build_object(
                    'id', a.id,
                    'author_name', a.author_name
                ) as author,
                CASE 
                    WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                    THEN MIN(d.discount_price) 
                    ELSE b.book_price 
                END as final_price,
                CASE 
                    WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                    THEN b.book_price - MIN(d.discount_price)
                    ELSE 0 
                END as discount_amount
            FROM book b
            LEFT JOIN discount d ON b.id = d.book_id
            JOIN author a ON b.author_id = a.id
            GROUP BY 
                b.id, 
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.id,
                a.author_name
            HAVING MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
            ORDER BY 
                discount_amount DESC
            LIMIT 10
        """)
        result = db.execute(sql_query)
        books = result.fetchall()
        return [dict(row._mapping) for row in books]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_book_by_id(db: Session, book_id: int) -> Dict[str, Any]:
    """
    Get a single book by ID
    """
    try:
        sql_query = text("""
        SELECT 
            b.id,
            b.book_title,
            b.book_summary,
            b.book_price,
            b.book_cover_photo,
            b.category_id,
            b.author_id,
            a.author_name,
            COALESCE(
                json_agg(
                    json_build_object(
                        'discount_price', d.discount_price,
                        'discount_end_date', d.discount_end_date
                    )
                ) FILTER (WHERE d.discount_price IS NOT NULL AND (d.discount_end_date IS NULL OR d.discount_end_date >= CURRENT_DATE)),
                '[]'::json
            ) as discounts,
            json_build_object(
                'id', a.id,
                'author_name', a.author_name
            ) as author,
            CASE 
                WHEN MIN(d.discount_price) IS NOT NULL AND (MIN(d.discount_end_date) IS NULL OR MIN(d.discount_end_date) >= CURRENT_DATE)
                THEN MIN(d.discount_price) 
                ELSE b.book_price 
            END as final_price
        FROM book b
        LEFT JOIN discount d ON b.id = d.book_id
        JOIN author a ON b.author_id = a.id
        WHERE b.id = :book_id
        GROUP BY 
            b.id, 
            b.book_title,
            b.book_summary,
            b.book_price,
            b.book_cover_photo,
            b.category_id,
            b.author_id,
            a.id,
            a.author_name
        """)
        result = db.execute(sql_query, {"book_id": book_id})
        book = result.fetchone()
        if book:
            return dict(book._mapping)
        else:
            raise HTTPException(status_code=404, detail="Book not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
